import { Request, Response, NextFunction } from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { AuditLogService } from '../../services/business/audit-log.service';

@injectable()
export class AuditMiddleware extends BaseMiddleware {
    constructor(
        @inject('AuditLogService') private auditLogService: AuditLogService
    ) {
        super();
    }

    public async handler(req: Request, res: Response, next: NextFunction) {
        const originalSend = res.send;
        
        // Wrap res.send to log only on successful mutating requests
        res.send = (body: any) => {
            const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
            if (mutatingMethods.includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
                const user = (req as any).user;
                const path = req.path;
                
                // Fire and forget auditing
                this.auditLogService.write({
                    actorUserId: user?.id,
                    action: `${req.method}_${path.toUpperCase().replace(/\//g, '_').substring(1)}`,
                    entity: path.split('/')[1] || 'system',
                    entityId: (req.params as any).id || (req.body as any).id,
                    metadata: {
                        method: req.method,
                        path: req.originalUrl,
                        statusCode: res.statusCode,
                        // Avoid logging sensitive body data like passwords
                        body: { ...req.body, password: undefined, passwordHash: undefined }
                    },
                    ip: req.ip
                }).catch(err => console.error('Audit log failed', err));
            }
            return originalSend.call(res, body);
        };

        next();
    }
}
