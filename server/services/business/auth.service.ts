import { injectable, inject } from 'inversify';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';

import { UserRepository } from '../../data/repositories/user.repository';
import { SessionsRepository } from '../../data/repositories/sessions.repository';
import { DatabaseConnection } from '../../data/database/connection';
import { users } from '../../data/models/users.schema';
import { authRefreshTokens, authUserRoles, authRoles } from '../../data/models/auth.schema';

interface SessionContext {
    ip?: string;
    userAgent?: string;
}

@injectable()
export class AuthService {
    private db: DatabaseConnection['db'];

    constructor(
        @inject('UserRepository') private userRepo: UserRepository,
        @inject('SessionsRepository') private sessionsRepo: SessionsRepository,
        @inject('DatabaseConnection') private dbConnection: DatabaseConnection
    ) {
        this.db = dbConnection.db;
    }

    async login(email: string, pass: string, sessionContext?: SessionContext) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error('Invalid credentials');
        if (!user.isActive) throw new Error('Account is inactive');
        if (user.isLocked) throw new Error('Account is locked due to too many failed attempts');

        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) {
            const attempts = (user.failedLoginAttempts ?? 0) + 1;
            const updates: Partial<typeof users.$inferInsert> = { failedLoginAttempts: attempts };
            if (attempts >= 5) updates.isLocked = true;
            await this.db.update(users).set(updates).where(eq(users.id, user.id));
            throw new Error('Invalid credentials');
        }

        // Reset failed attempts and record last login
        await this.db.update(users)
            .set({ failedLoginAttempts: 0, lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

        // Create session
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
        const sessionExpiresAt = this.addDuration(new Date(), jwtExpiresIn);
        const session = await this.sessionsRepo.create({
            userId: user.id,
            userAgent: sessionContext?.userAgent ?? null,
            ipAddress: sessionContext?.ip ?? null,
            expiresAt: sessionExpiresAt,
        });

        // Generate and store refresh token
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await this.db.insert(authRefreshTokens).values({
            userId: user.id,
            sessionId: session.id,
            tokenHash,
            expiresAt: this.addDuration(new Date(), process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
        });

        // Issue JWT
        const jti = crypto.randomUUID();
        const secret = process.env.JWT_SECRET || 'top-secret';
        const access_token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email, fullName: user.fullName, sessionId: session.id, jti },
            secret,
            { expiresIn: jwtExpiresIn as any }
        );

        return {
            access_token,
            refresh_token: refreshToken,
            sessionId: session.id,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                department: user.department,
                designation: user.designation,
            },
        };
    }

    async register(data: any) {
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) throw new Error('Email already registered');

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
        const passwordHash = await bcrypt.hash(data.password, saltRounds);

        const [user] = await this.db.insert(users).values({
            email: data.email,
            username: data.username ?? data.email.split('@')[0],
            passwordHash,
            fullName: data.fullName,
            role: data.role ?? 'employee',
            department: data.department ?? null,
        }).returning();

        // Assign role in auth_user_roles
        if (data.role) {
            const roleRows = await this.db
                .select()
                .from(authRoles)
                .where(eq(authRoles.key, data.role.toLowerCase()));
            if (roleRows[0]) {
                await this.db.insert(authUserRoles).values({ userId: user.id, roleId: roleRows[0].id });
            }
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                department: user.department,
            },
        };
    }

    async logout(sessionId: string) {
        if (sessionId) {
            await this.sessionsRepo.revokeSession(sessionId);
        }
        return true;
    }

    async getCurrentUser(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error('User not found');
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            department: user.department,
            designation: user.designation,
            mfaEnabled: user.mfaEnabled,
        };
    }

    async refreshToken(refreshTokenStr: string) {
        const tokenHash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');

        const rows = await this.db
            .select()
            .from(authRefreshTokens)
            .where(and(eq(authRefreshTokens.tokenHash, tokenHash), isNull(authRefreshTokens.revokedAt)));

        const tokenRecord = rows[0];
        if (!tokenRecord) throw new Error('Invalid refresh token');
        if (tokenRecord.expiresAt < new Date()) throw new Error('Refresh token expired');

        const user = await this.userRepo.findById(tokenRecord.userId);
        if (!user || !user.isActive || user.isLocked) throw new Error('User unavailable');

        // Rotate: revoke old token
        await this.db.update(authRefreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(authRefreshTokens.id, tokenRecord.id));

        // Issue new refresh token
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        await this.db.insert(authRefreshTokens).values({
            userId: user.id,
            sessionId: tokenRecord.sessionId,
            tokenHash: newTokenHash,
            rotatedFromId: tokenRecord.id,
            expiresAt: this.addDuration(new Date(), process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
        });

        // Issue new access token
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
        const jti = crypto.randomUUID();
        const secret = process.env.JWT_SECRET || 'top-secret';
        const access_token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email, fullName: user.fullName, sessionId: tokenRecord.sessionId, jti },
            secret,
            { expiresIn: jwtExpiresIn as any }
        );

        return { access_token, refresh_token: newRefreshToken };
    }

    async getSessions(userId: string) {
        return this.sessionsRepo.listActiveSessions(userId);
    }

    async revokeSession(sessionId: string) {
        return this.sessionsRepo.revokeSession(sessionId);
    }

    async getMfaStatus(userId: string) {
        return this.userRepo.getMfaStatus(userId);
    }

    async setupMfa(userId: string) {
        const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).slice(-8));
        await this.userRepo.updateMfa(userId, { mfaSetupCompleted: true, mfaBackupCodes: backupCodes });
        return { backupCodes, message: 'MFA setup initiated' };
    }

    async verifyMfa(userId: string, code: string) {
        await this.userRepo.updateMfa(userId, { mfaEnabled: true, mfaLastVerified: new Date() });
        return { success: true };
    }

    async disableMfa(userId: string) {
        await this.userRepo.updateMfa(userId, { mfaEnabled: false, mfaSetupCompleted: false, mfaBackupCodes: [], mfaLastVerified: null });
        return { success: true };
    }

    async enableMfa(userId: string, method: string) {
        const setup = await this.setupMfa(userId);
        return { success: true, secret: 'TOTP_SECRET_PLACEHOLDER', ...setup };
    }

    async verifyMfaToken(userId: string, token: string) {
        return this.verifyMfa(userId, token);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error('User not found');
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) throw new Error('Current password is incorrect');
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.userRepo.updatePassword(userId, passwordHash);
        return { success: true };
    }

    /** Parse a duration string like "15m", "1h", "7d" and return a future Date. */
    private addDuration(from: Date, duration: string): Date {
        const result = new Date(from);
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) return new Date(from.getTime() + 15 * 60 * 1000);
        const value = parseInt(match[1], 10);
        switch (match[2]) {
            case 's': result.setSeconds(result.getSeconds() + value); break;
            case 'm': result.setMinutes(result.getMinutes() + value); break;
            case 'h': result.setHours(result.getHours() + value); break;
            case 'd': result.setDate(result.getDate() + value); break;
        }
        return result;
    }
}
