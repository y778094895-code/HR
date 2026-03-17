import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { users } from '../models/index';
import { eq } from 'drizzle-orm';

@injectable()
export class UserRepository extends BaseRepository<typeof users> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, users);
    }

    async findByEmail(email: string) {
        const result = await this.db.select().from(users).where(eq(users.email, email));
        return result[0];
    }

    async findById(id: string) {
        const result = await this.db.select().from(users).where(eq(users.id, id));
        return result[0];
    }

    async create(data: any) {
        const result = await this.db.insert(users).values(data).returning();
        return result[0];
    }

    async getMfaStatus(userId: string) {
        const user = await this.findById(userId);
        if (!user) return null;
        return {
            mfaEnabled: user.mfaEnabled,
            mfaSetupCompleted: user.mfaSetupCompleted,
            mfaLastVerified: user.mfaLastVerified
        };
    }

    async updateMfa(userId: string, updates: { mfaEnabled?: boolean; mfaSetupCompleted?: boolean; mfaBackupCodes?: any[]; mfaLastVerified?: Date }) {
        const result = await this.db.update(users)
            .set(updates)
            .where(eq(users.id, userId))
            .returning();
        return result[0];
    }

    async updatePassword(userId: string, passwordHash: string) {
        const result = await this.db.update(users)
            .set({ passwordHash })
            .where(eq(users.id, userId))
            .returning();
        return result[0];
    }
}

