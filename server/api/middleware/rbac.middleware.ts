import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../shared/api-response';

const ROLE_HIERARCHY = ['GUEST', 'EMPLOYEE', 'HR', 'MANAGER', 'ADMIN'] as const;
type Role = (typeof ROLE_HIERARCHY)[number];

function normalizeRole(input: any): Role {
    const role = String(input || 'GUEST').toUpperCase();
    if (role === 'ADMIN' || role === 'SYSTEM_ADMIN' || role === 'SUPER_ADMIN') return 'ADMIN';
    if (role === 'MANAGER') return 'MANAGER';
    if (role === 'HR' || role === 'HR_MANAGER') return 'HR';
    if (role === 'EMPLOYEE' || role === 'USER') return 'EMPLOYEE';
    return 'GUEST';
}

export function requireRole(minRole: Role) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        const correlationId = (req as any).correlationId;
        if (!user) {
            return res.status(401).json(
                ApiResponse.error('UNAUTHORIZED', 'Unauthorized', undefined, { correlationId })
            );
        }

        const currentRole = normalizeRole(user.role);
        const currentRank = ROLE_HIERARCHY.indexOf(currentRole);
        const requiredRank = ROLE_HIERARCHY.indexOf(minRole);

        if (currentRank < requiredRank) {
            return res.status(403).json(
                ApiResponse.error('FORBIDDEN', 'Insufficient permissions', { requiredRole: minRole }, { correlationId })
            );
        }

        next();
    };
}
