// ============================================================
// Alerts Center — RBAC Permissions Matrix
// ============================================================
import type { Alert, AlertPermissions, AlertViewScope, AlertAction } from '@/types/alerts';

/**
 * Maps existing code roles to alert permissions.
 *
 * Spec Role       → Code Role
 * HR              → admin         (full access)
 * Dept Manager    → manager       (department-scoped, can convert + escalate)
 * Team Supervisor → employee      (team-scoped, can convert only)
 * System Admin    → super_admin   (data quality only)
 */
const PERMISSIONS_MAP: Record<string, AlertPermissions> = {
    admin: {
        canView: true,
        viewScope: 'all',
        canConvert: true,
        canDismiss: true,
        canEscalate: true,
        canAcknowledge: true,
        canAssign: true,
    },
    manager: {
        canView: true,
        viewScope: 'department',
        canConvert: true,
        canDismiss: false,
        canEscalate: true,
        canAcknowledge: true,
        canAssign: true,
    },
    employee: {
        canView: true,
        viewScope: 'team',
        canConvert: true,
        canDismiss: false,
        canEscalate: false,
        canAcknowledge: true,
        canAssign: false,
    },
    super_admin: {
        canView: true,
        viewScope: 'data_quality_only',
        canConvert: false,
        canDismiss: false,
        canEscalate: false,
        canAcknowledge: true,
        canAssign: false,
    },
};

const DEFAULT_PERMISSIONS: AlertPermissions = {
    canView: false,
    viewScope: 'all',
    canConvert: false,
    canDismiss: false,
    canEscalate: false,
    canAcknowledge: false,
    canAssign: false,
};

export function getAlertPermissions(role?: string | null): AlertPermissions {
    if (!role) return DEFAULT_PERMISSIONS;
    return PERMISSIONS_MAP[role] ?? DEFAULT_PERMISSIONS;
}

/**
 * Filters alerts based on user role scope.
 */
export function filterAlertsByRole(
    alerts: Alert[],
    role?: string | null,
    userDepartment?: string
): Alert[] {
    const perms = getAlertPermissions(role);
    if (!perms.canView) return [];

    switch (perms.viewScope) {
        case 'all':
            return alerts;

        case 'aggregate':
            // Executives see all but with masked employee data (handled in UI)
            return alerts;

        case 'department':
            if (!userDepartment) return alerts;
            return alerts.filter(
                (a) => !a.department || a.department === userDepartment
            );

        case 'team':
            // Team supervisors see only alerts without specific department or their own
            if (!userDepartment) return alerts;
            return alerts.filter(
                (a) => !a.department || a.department === userDepartment
            );

        case 'data_quality_only':
            return alerts.filter((a) => a.type === 'DATA_QUALITY');

        default:
            return alerts;
    }
}

/**
 * Checks if a specific action is allowed for a role.
 */
export function isActionAllowed(
    role: string | null | undefined,
    action: AlertAction
): boolean {
    const perms = getAlertPermissions(role);

    switch (action) {
        case 'ACKNOWLEDGE':
        case 'MARK_READ':
            return perms.canAcknowledge;
        case 'CONVERT_TO_CASE':
            return perms.canConvert;
        case 'DISMISS':
        case 'CLOSE':
        case 'ARCHIVE':
            return perms.canDismiss;
        case 'ESCALATE':
            return perms.canEscalate;
        case 'ASSIGN':
            return perms.canAssign;
        default:
            return false;
    }
}

/**
 * Whether employee-identifying data should be masked for this role.
 */
export function shouldMaskEmployeeData(role?: string | null): boolean {
    // Aggregate-only roles see no employee identifiers
    const perms = getAlertPermissions(role);
    return perms.viewScope === 'aggregate';
}
