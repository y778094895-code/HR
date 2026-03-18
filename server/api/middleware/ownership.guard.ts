/**
 * Ownership guard — enforces manager-scoped access to employee resources.
 *
 * Usage (in controllers):
 *   import { ownershipGuard } from '../middleware/ownership.guard';
 *
 *   @httpGet('/:employeeId', ownershipGuard)
 *   async getEmployee(req: Request, res: Response) { ... }
 *
 * Rules:
 *   - ADMIN / HR: always allowed (full org scope).
 *   - MANAGER:   allowed when the target employee's managerId matches req.user.employeeId.
 *   - EMPLOYEE:  allowed only when the target employeeId === req.user.employeeId (own record).
 *   - Others:    403 Forbidden.
 *
 * The guard reads the employeeId from req.params.employeeId or req.params.id and performs
 * a single DB lookup to resolve the employee's managerId.
 */
import { Request, Response, NextFunction } from 'express';
import { db } from '../../data/database/connection';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { eq } from 'drizzle-orm';

const UNRESTRICTED_ROLES = new Set(['ADMIN', 'HR', 'SUPER_ADMIN']);

export async function ownershipGuard(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const user = (req as any).user as
        | { id: string; role: string; employeeId?: string }
        | undefined;

    if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
    }

    // HR / Admin always pass through
    if (UNRESTRICTED_ROLES.has(user.role)) {
        return next();
    }

    const targetId = req.params.employeeId ?? req.params.id;

    if (!targetId) {
        // No employee ID in route — cannot enforce ownership, let the controller decide
        return next();
    }

    // Employees can read their own record
    if (user.role === 'EMPLOYEE') {
        if (user.employeeId && user.employeeId === targetId) {
            return next();
        }
        res.status(403).json({ success: false, message: 'Access denied. Employees can only view their own records.' });
        return;
    }

    // Managers can read records of their direct reports
    if (user.role === 'MANAGER') {
        const [target] = await db
            .select({ managerId: employeesLocal.managerId })
            .from(employeesLocal)
            .where(eq(employeesLocal.id, targetId))
            .limit(1);

        if (target?.managerId && target.managerId === user.employeeId) {
            return next();
        }

        res.status(403).json({
            success: false,
            message: 'Access denied. You can only view records of your direct reports.',
        });
        return;
    }

    // Any other role is denied
    res.status(403).json({ success: false, message: 'Access denied.' });
}
