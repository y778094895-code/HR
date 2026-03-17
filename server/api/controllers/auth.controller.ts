import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { AuthService } from '../../services/business/auth.service';
import { ApiResponse } from '../../shared/api-response';
import { AuditLogService } from '../../services/business/audit-log.service';

@controller('/auth')
export class AuthController {
    constructor(
        @inject('AuthService') private authService: AuthService,
        @inject('AuditLogService') private auditLogService: AuditLogService
    ) { }

    @httpPost('/login')
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const { email, password } = req.body ?? {};
            if (!email || !password) {
                return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'email and password are required', undefined, { correlationId }));
            }

            const result = await this.authService.login(email, password, {
                ip: req.ip,
                userAgent: req.headers['user-agent'] as string | undefined,
            });

            await this.auditLogService.write({
                actorUserId: result.user?.id,
                action: 'AUTH_LOGIN',
                entity: 'auth_session',
                entityId: result.sessionId || result.user?.id,
                metadata: { email },
                ip: req.ip,
            });

            res.json(ApiResponse.success(
                { access_token: result.access_token, refresh_token: result.refresh_token, user: result.user },
                'Login successful',
                { correlationId }
            ));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            const message = error?.message || 'Invalid credentials';
            const isAuth = ['Invalid credentials', 'Account is inactive', 'Account is locked due to too many failed attempts'].includes(message);
            const status = isAuth ? 401 : 500;
            res.status(status).json(ApiResponse.error(
                isAuth ? 'INVALID_CREDENTIALS' : 'INTERNAL_SERVER_ERROR',
                message,
                undefined,
                { correlationId }
            ));
        }
    }

    @httpPost('/register')
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const requestingUser = (req as any).user;

            // Admin only
            if (!requestingUser || !['admin', 'ADMIN', 'system_admin'].includes(requestingUser.role)) {
                return res.status(403).json(ApiResponse.error('FORBIDDEN', 'Admin access required', undefined, { correlationId }));
            }

            const result = await this.authService.register(req.body);
            await this.auditLogService.write({
                actorUserId: requestingUser?.id,
                action: 'AUTH_REGISTER',
                entity: 'user',
                entityId: result.user?.id,
                metadata: { email: result.user?.email, role: result.user?.role },
                ip: req.ip,
            });
            res.status(201).json(ApiResponse.success(result, 'User created', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(400).json(ApiResponse.error('VALIDATION_ERROR', error?.message || 'Registration failed', undefined, { correlationId }));
        }
    }

    @httpPost('/logout')
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const sessionId = (req as any).user?.sessionId;
            const userId = (req as any).user?.sub || (req as any).user?.id;

            if (sessionId) {
                await this.authService.logout(sessionId);
            }

            if (userId) {
                await this.auditLogService.write({
                    actorUserId: userId,
                    action: 'AUTH_LOGOUT',
                    entity: 'auth_session',
                    entityId: sessionId || userId,
                    metadata: {},
                    ip: req.ip,
                });
            }

            res.json(ApiResponse.success({ message: 'Logged out' }, 'Logged out successfully', { correlationId }));
        } catch (error) {
            next(error);
        }
    }

    @httpGet('/me')
    async getCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub || (req as any).user?.id;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId }));
            }
            const result = await this.authService.getCurrentUser(userId);
            res.json(ApiResponse.success(result, 'Success', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(404).json(ApiResponse.error('NOT_FOUND', error?.message || 'User not found', undefined, { correlationId }));
        }
    }

    @httpPost('/refresh-token')
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const { refresh_token } = req.body ?? {};
            if (!refresh_token) {
                return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'refresh_token is required', undefined, { correlationId }));
            }
            const result = await this.authService.refreshToken(refresh_token);
            res.json(ApiResponse.success(result, 'Token refreshed', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(401).json(ApiResponse.error('UNAUTHORIZED', error?.message || 'Failed to refresh token', undefined, { correlationId }));
        }
    }

    @httpGet('/sessions')
    async getSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub || (req as any).user?.id;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId }));
            }
            const sessions = await this.authService.getSessions(userId);
            res.json(ApiResponse.success(sessions, 'Sessions retrieved', { correlationId }));
        } catch (error) {
            next(error);
        }
    }

    @httpPost('/sessions/:id/revoke')
    async revokeSession(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub || (req as any).user?.id;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId }));
            }
            const session = await this.authService.revokeSession(req.params.id);
            await this.auditLogService.write({
                actorUserId: userId,
                action: 'SESSION_REVOKE',
                entity: 'auth_session',
                entityId: req.params.id,
                metadata: {},
                ip: req.ip,
            });
            res.json(ApiResponse.success(session, 'Session revoked', { correlationId }));
        } catch (error) {
            next(error);
        }
    }

    @httpGet('/mfa/status')
    async getMfaStatus(req: Request, res: Response) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId }));
            }
            const result = await this.authService.getMfaStatus(userId);
            res.json(ApiResponse.success(result, 'MFA status retrieved', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(400).json(ApiResponse.error('VALIDATION_ERROR', error?.message || 'Failed to get MFA status', undefined, { correlationId }));
        }
    }

    @httpPost('/mfa/setup')
    async setupMfa(req: Request, res: Response) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId }));
            }
            const result = await this.authService.setupMfa(userId);
            await this.auditLogService.write({
                actorUserId: userId,
                action: 'MFA_SETUP',
                entity: 'user_mfa',
                entityId: userId
            });
            res.json(ApiResponse.success(result, 'MFA setup initiated', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(400).json(ApiResponse.error('VALIDATION_ERROR', error?.message || 'Failed to setup MFA', undefined, { correlationId }));
        }
    }

    @httpPost('/mfa/verify')
    async verifyMfa(req: Request, res: Response) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub;
            const { code } = req.body;
            if (!userId || !code) {
                return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'userId and code required', undefined, { correlationId }));
            }
            const result = await this.authService.verifyMfa(userId, code);
            await this.auditLogService.write({
                actorUserId: userId,
                action: 'MFA_VERIFY',
                entity: 'user_mfa',
                entityId: userId
            });
            res.json(ApiResponse.success(result, 'MFA verified', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(400).json(ApiResponse.error('VALIDATION_ERROR', error?.message || 'MFA verify failed', undefined, { correlationId }));
        }
    }

    @httpPost('/mfa/disable')
    async disableMfa(req: Request, res: Response) {
        try {
            const correlationId = (req as any).correlationId;
            const userId = (req as any).user?.sub;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId }));
            }
            const result = await this.authService.disableMfa(userId);
            await this.auditLogService.write({
                actorUserId: userId,
                action: 'MFA_DISABLE',
                entity: 'user_mfa',
                entityId: userId
            });
            res.json(ApiResponse.success(result, 'MFA disabled', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            res.status(400).json(ApiResponse.error('VALIDATION_ERROR', error?.message || 'Failed to disable MFA', undefined, { correlationId }));
        }
    }
}
