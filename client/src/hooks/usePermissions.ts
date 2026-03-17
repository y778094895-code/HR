import { useAuthStore } from '@/stores/business/auth.store';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'supervisor' | 'hr' | 'executive' | 'analyst' | 'employee' | string;

export function usePermissions() {
    const { user } = useAuthStore();
    const role: UserRole = user?.role?.toLowerCase() || 'employee';

    return {
        // High-level aggregates (Executives, Admins)
        canViewExecutiveDashboards: ['super_admin', 'admin', 'executive', 'hr'].includes(role),

        // Detailed Risk and XAI (HR, Analytics, Admins)
        canViewXaiDrivers: ['super_admin', 'admin', 'hr', 'analyst', 'manager'].includes(role),
        canViewRiskFull: ['super_admin', 'admin', 'hr', 'executive', 'manager'].includes(role),

        // Actionable paths (Management, HR)
        canCreateCase: ['super_admin', 'admin', 'hr', 'manager', 'supervisor'].includes(role),
        canAssignIntervention: ['super_admin', 'admin', 'hr', 'manager'].includes(role),

        // Data Privacy (Salary, specific HR flags)
        canViewSalary: ['super_admin', 'admin', 'hr'].includes(role),
        canExportData: ['super_admin', 'admin', 'hr', 'analyst', 'manager'].includes(role),

        // System Settings
        canManageSystem: ['super_admin', 'admin'].includes(role),
    };
}
