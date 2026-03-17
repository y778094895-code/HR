import { Request, Response, NextFunction } from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';

@injectable()
export class AuthMiddleware extends BaseMiddleware {
    public handler(req: Request, res: Response, next: NextFunction) {
        // Try JWT from Authorization: Bearer <token> header first
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            try {
                const secret = process.env.JWT_SECRET;
                if (!secret) {
                    console.error('[AuthMiddleware] JWT_SECRET environment variable is not set');
                    return next();
                }
                const payload = jwt.verify(token, secret) as any;
                (req as any).user = {
                    id: payload.userId,
                    sub: payload.userId,
                    role: payload.role,
                    email: payload.email,
                    fullName: payload.fullName,
                    sessionId: payload.sessionId,
                    jti: payload.jti,
                };
                return next();
            } catch {
                // Invalid or expired JWT — fall through to gateway-header check
            }
        }

        // Fallback: identity injected by API Gateway headers
        const userId = req.headers['x-user-id'] as string;
        const userRole = req.headers['x-user-role'] as string;

        if (userId) {
            (req as any).user = {
                id: userId,
                sub: userId,
                role: userRole || 'GUEST'
            };
        } else {
            // Let the endpoint controller decide whether to reject undefined req.user
            (req as any).user = undefined;
        }

        next();
    }
}
