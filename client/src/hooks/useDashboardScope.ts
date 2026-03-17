// ============================================================
// Dashboard RBAC Scope Hook
// Maps existing roles to dashboard visibility & data scope.
// ============================================================

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type DataScope = 'org' | 'department' | 'team';

export interface DashboardScope {
    /** Which dashboard sections this role can see */
    visibleSections: {
        kpiStrip: boolean;
        riskIntelligence: boolean;
        performanceIntelligence: boolean;
        fairnessMonitoring: boolean;
        activeCases: boolean;
        actionFeed: boolean;
    };
    /** Data scope for filtering */
    dataScope: DataScope;
    /** Whether the user can export data */
    canExport: boolean;
    /** Whether the user can see analytics (false for super_admin) */
    canSeeAnalytics: boolean;
    /** Whether the user can create cases */
    canCreateCase: boolean;
    /** Role label for display */
    roleLabel: string;
}

/**
 * Returns the dashboard scope configuration based on the current user's role.
 * 
 * Role Mapping (Spec → Code):
 * - Executive   → admin (view=executive)  → Aggregate only
 * - HR          → admin                   → Full org access
 * - Dept Mgr    → manager                 → Own department only
 * - Team Super  → manager (team scope)    → Own team only
 * - Data Analyst→ admin (view=analyst)    → Full data + export
 * - System Admin→ super_admin             → No analytics
 */
export function useDashboardScope(): DashboardScope {
    const { role } = useAuth();

    return useMemo(() => {
        switch (role) {
            case 'admin':
                return {
                    visibleSections: {
                        kpiStrip: true,
                        riskIntelligence: true,
                        performanceIntelligence: true,
                        fairnessMonitoring: true,
                        activeCases: true,
                        actionFeed: true,
                    },
                    dataScope: 'org' as DataScope,
                    canExport: true,
                    canSeeAnalytics: true,
                    canCreateCase: true,
                    roleLabel: 'مدير الموارد البشرية',
                };

            case 'manager':
                return {
                    visibleSections: {
                        kpiStrip: true,
                        riskIntelligence: true,
                        performanceIntelligence: true,
                        fairnessMonitoring: false,
                        activeCases: true,
                        actionFeed: true,
                    },
                    dataScope: 'department' as DataScope,
                    canExport: false,
                    canSeeAnalytics: true,
                    canCreateCase: true,
                    roleLabel: 'مدير القسم',
                };

            case 'super_admin':
                return {
                    visibleSections: {
                        kpiStrip: false,
                        riskIntelligence: false,
                        performanceIntelligence: false,
                        fairnessMonitoring: false,
                        activeCases: true,
                        actionFeed: true,
                    },
                    dataScope: 'org' as DataScope,
                    canExport: false,
                    canSeeAnalytics: false,
                    canCreateCase: true,
                    roleLabel: 'مسؤول النظام',
                };

            case 'employee':
            default:
                return {
                    visibleSections: {
                        kpiStrip: true,
                        riskIntelligence: false,
                        performanceIntelligence: true,
                        fairnessMonitoring: false,
                        activeCases: false,
                        actionFeed: false,
                    },
                    dataScope: 'team' as DataScope,
                    canExport: false,
                    canSeeAnalytics: true,
                    canCreateCase: false,
                    roleLabel: 'موظف',
                };
        }
    }, [role]);
}

