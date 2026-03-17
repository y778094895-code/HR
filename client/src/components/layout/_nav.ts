import {
    LucideIcon,
    LayoutDashboard,
    Zap,
    Users,
    Shield,
    ArrowUpRight,
    TrendingUp,
    UserMinus,
    GraduationCap,
    Scale,
    FileText,
    Settings,
    HelpCircle,
    Bell,
    Briefcase,
    Lightbulb,
    Database,
    User,
} from 'lucide-react';

export interface NavItem {
    id: string;
    labelKey: string;
    path?: string; // Optional if it only has children
    icon: LucideIcon;
    rolesAllowed?: string[]; // If undefined, accessible by all
    children?: NavItem[];

}

export const NAV_ITEMS: NavItem[] = [
    {
        id: 'dashboard',
        labelKey: 'nav.dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        id: 'alerts',
        labelKey: 'nav.alerts',
        path: '/dashboard/alerts',
        icon: Bell,
        children: [
            { id: 'alerts-all', labelKey: 'nav.allAlerts', path: '/dashboard/alerts/all', icon: Bell },
            { id: 'alerts-unread', labelKey: 'nav.unreadAlerts', path: '/dashboard/alerts/unread', icon: Bell },
            { id: 'alerts-high', labelKey: 'nav.highSeverityAlerts', path: '/dashboard/alerts/high-risk', icon: Bell },
            { id: 'alerts-response', labelKey: 'nav.responseLog', path: '/dashboard/alerts/response-log', icon: Bell },
        ]
    },
    {
        id: 'cases',
        labelKey: 'nav.cases',
        path: '/dashboard/cases',
        icon: Briefcase,
        children: [
            { id: 'cases-open', labelKey: 'nav.openCases', path: '/dashboard/cases?view=open', icon: Briefcase },
            { id: 'cases-progress', labelKey: 'nav.inProgressCases', path: '/dashboard/cases?view=progress', icon: Briefcase },
            { id: 'cases-review', labelKey: 'nav.underReviewCases', path: '/dashboard/cases?view=review', icon: Briefcase },
            { id: 'cases-closed', labelKey: 'nav.closedCases', path: '/dashboard/cases?view=closed', icon: Briefcase },
        ]
    },
    {
        id: 'employees',
        labelKey: 'nav.employees',
        path: '/dashboard/employees',
        icon: Users,
        rolesAllowed: ['admin', 'manager'],
        children: [
            { id: 'emp-directory', labelKey: 'nav.directory', path: '/dashboard/employees?view=directory', icon: Users, rolesAllowed: ['admin', 'manager'] },
            { id: 'emp-profile', labelKey: 'nav.profile', path: '/dashboard/employees?view=profile', icon: User, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'performance',
        labelKey: 'nav.performance',
        path: '/dashboard/performance',
        icon: TrendingUp,
        rolesAllowed: ['admin', 'manager'],
        children: [
            { id: 'perf-continuous', labelKey: 'nav.continuousAnalysis', path: '/dashboard/performance?view=continuous', icon: TrendingUp, rolesAllowed: ['admin', 'manager'] },
            { id: 'perf-kpi', labelKey: 'nav.kpis', path: '/dashboard/performance?view=kpi', icon: TrendingUp, rolesAllowed: ['admin', 'manager'] },
            { id: 'perf-underperformance', labelKey: 'nav.earlyUnderperformance', path: '/dashboard/performance?view=underperformance', icon: TrendingUp, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'attrition',
        labelKey: 'nav.attrition',
        path: '/dashboard/attrition',
        icon: UserMinus,
        rolesAllowed: ['admin', 'manager'],
        children: [
            { id: 'attr-risk', labelKey: 'nav.riskPrediction', path: '/dashboard/attrition?view=risk', icon: UserMinus, rolesAllowed: ['admin', 'manager'] },
            { id: 'attr-drivers', labelKey: 'nav.riskDrivers', path: '/dashboard/attrition?view=drivers', icon: UserMinus, rolesAllowed: ['admin', 'manager'] },
            { id: 'attr-cost', labelKey: 'nav.attritionCost', path: '/dashboard/attrition?view=cost', icon: UserMinus, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'training',
        labelKey: 'nav.training',
        path: '/dashboard/training',
        icon: GraduationCap,
        rolesAllowed: ['admin', 'manager', 'employee'], // Employee permitted
        children: [
            { id: 'train-needs', labelKey: 'nav.trainingNeedPrediction', path: '/dashboard/training?view=needs', icon: GraduationCap, rolesAllowed: ['admin', 'manager'] },
            { id: 'train-programs', labelKey: 'nav.programMatching', path: '/dashboard/training?view=programs', icon: GraduationCap, rolesAllowed: ['admin', 'manager', 'employee'] },
            { id: 'train-impact', labelKey: 'nav.trainingImpact', path: '/dashboard/training?view=impact', icon: GraduationCap, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'fairness',
        labelKey: 'nav.fairness',
        path: '/dashboard/fairness',
        icon: Scale,
        rolesAllowed: ['admin'], // Admin only
        children: [
            { id: 'fair-monitoring', labelKey: 'nav.fairnessMonitoring', path: '/dashboard/fairness?view=monitoring', icon: Scale, rolesAllowed: ['admin'] },
            { id: 'fair-alerts', labelKey: 'nav.alertsAndReports', path: '/dashboard/fairness?view=alerts', icon: Scale, rolesAllowed: ['admin'] },
            { id: 'fair-explanations', labelKey: 'nav.fairnessExplanations', path: '/dashboard/fairness?view=explanations', icon: Scale, rolesAllowed: ['admin'] },
        ]
    },
    {
        id: 'recommendations',
        labelKey: 'nav.recommendations',
        path: '/dashboard/recommendations',
        icon: Lightbulb,
        rolesAllowed: ['admin', 'manager'],
        children: [
            { id: 'rec-smart', labelKey: 'nav.smartRecommendations', path: '/dashboard/recommendations?view=smart', icon: Lightbulb, rolesAllowed: ['admin', 'manager'] },
            { id: 'rec-uplift', labelKey: 'nav.expectedUplift', path: '/dashboard/recommendations?view=uplift', icon: Lightbulb, rolesAllowed: ['admin', 'manager'] },
            { id: 'rec-simulation', labelKey: 'nav.whatIfSimulation', path: '/dashboard/recommendations?view=simulation', icon: Lightbulb, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'impact',
        labelKey: 'nav.impact',
        path: '/dashboard/impact',
        icon: ArrowUpRight,
        rolesAllowed: ['admin', 'manager'],
        children: [
            { id: 'imp-performance', labelKey: 'nav.impactOnPerformance', path: '/dashboard/impact?view=performance', icon: ArrowUpRight, rolesAllowed: ['admin', 'manager'] },
            { id: 'imp-attrition', labelKey: 'nav.impactOnAttrition', path: '/dashboard/impact?view=attrition', icon: ArrowUpRight, rolesAllowed: ['admin', 'manager'] },
            { id: 'imp-training', labelKey: 'nav.impactOfTraining', path: '/dashboard/impact?view=training', icon: ArrowUpRight, rolesAllowed: ['admin', 'manager'] },
            { id: 'imp-comparison', labelKey: 'nav.periodComparison', path: '/dashboard/impact?view=comparison', icon: ArrowUpRight, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'reports',
        labelKey: 'nav.reports',
        path: '/dashboard/reports',
        icon: FileText,
        rolesAllowed: ['admin', 'manager'],
        children: [
            { id: 'rep-library', labelKey: 'nav.reportLibrary', path: '/dashboard/reports?view=library', icon: FileText, rolesAllowed: ['admin', 'manager'] },
            { id: 'rep-builder', labelKey: 'nav.reportBuilder', path: '/dashboard/reports?view=builder', icon: FileText, rolesAllowed: ['admin', 'manager'] },
            { id: 'rep-exports', labelKey: 'nav.exports', path: '/dashboard/reports?view=exports', icon: FileText, rolesAllowed: ['admin', 'manager'] },
        ]
    },
    {
        id: 'data-quality',
        labelKey: 'nav.dataQuality',
        path: '/dashboard/data-quality',
        icon: Database,
        rolesAllowed: ['admin', 'super_admin'],
        children: [
            { id: 'dq-scan', labelKey: 'nav.missingConflictingScan', path: '/dashboard/data-quality?view=scan', icon: Database, rolesAllowed: ['admin', 'super_admin'] },
            { id: 'dq-policies', labelKey: 'nav.policies', path: '/dashboard/data-quality?view=policies', icon: Database, rolesAllowed: ['admin', 'super_admin'] },
            { id: 'dq-audit', labelKey: 'nav.auditLog', path: '/dashboard/data-quality?view=audit', icon: Database, rolesAllowed: ['admin', 'super_admin'] },
            { id: 'dq-alerts', labelKey: 'nav.criticalAlerts', path: '/dashboard/data-quality?view=alerts', icon: Database, rolesAllowed: ['admin', 'super_admin'] },
        ]
    },
    {
        id: 'users',
        labelKey: 'nav.users',
        path: '/dashboard/users',
        icon: Shield,
        rolesAllowed: ['admin', 'super_admin'],
        children: [
            { id: 'usr-users', labelKey: 'nav.usersList', path: '/dashboard/users?view=users', icon: Shield, rolesAllowed: ['admin', 'super_admin'] },
            { id: 'usr-roles', labelKey: 'nav.roles', path: '/dashboard/users?view=roles', icon: Shield, rolesAllowed: ['admin', 'super_admin'] },
            { id: 'usr-visibility', labelKey: 'nav.dataVisibility', path: '/dashboard/users?view=visibility', icon: Shield, rolesAllowed: ['admin', 'super_admin'] },
            { id: 'usr-audit', labelKey: 'nav.accessAudit', path: '/dashboard/users?view=audit', icon: Shield, rolesAllowed: ['admin', 'super_admin'] },
        ]
    },
    {
        id: 'settings',
        labelKey: 'nav.settings',
        path: '/dashboard/settings',
        icon: Settings,
        children: [
            { id: 'set-org', labelKey: 'nav.organizationSettings', path: '/dashboard/settings?view=org', icon: Settings },
            { id: 'set-thresholds', labelKey: 'nav.thresholdSettings', path: '/dashboard/settings?view=thresholds', icon: Settings },
            { id: 'set-models', labelKey: 'nav.modelSettings', path: '/dashboard/settings?view=models', icon: Settings },
            { id: 'set-notifications', labelKey: 'nav.notificationChannels', path: '/dashboard/settings?view=notifications', icon: Settings },
            { id: 'set-export', labelKey: 'nav.exportSettings', path: '/dashboard/settings?view=export', icon: Settings },
        ]
    },
    {
        id: 'help',
        labelKey: 'nav.help',
        path: '/dashboard/help',
        icon: HelpCircle,
        children: [
            { id: 'help-guide', labelKey: 'nav.userGuide', path: '/dashboard/help?view=guide', icon: HelpCircle },
            { id: 'help-faq', labelKey: 'nav.faq', path: '/dashboard/help?view=faq', icon: HelpCircle },
            { id: 'help-support', labelKey: 'nav.support', path: '/dashboard/help?view=support', icon: HelpCircle },
        ]
    },

];

/**
 * Filters navigation items based on the user's role.
 * @param items The list of navigation items.
 * @param userRole The role of the current user.
 * @returns A list of navigation items accessible to the user.
 */
export const filterNavByRole = (items: NavItem[], userRole?: string): NavItem[] => {
    const filteredItems: NavItem[] = [];

    items.forEach(item => {
        // Check if the current user lacks the role needed for this primary item
        if (item.rolesAllowed && (!userRole || !item.rolesAllowed.includes(userRole))) {
            return;
        }

        const navItem = { ...item };

        // Recursively filter children sub-items
        if (navItem.children) {
            navItem.children = filterNavByRole(navItem.children, userRole);

            // If it had children originally, but all children were filtered out, hide parent section
            if (item.children && item.children.length > 0 && navItem.children.length === 0) {
                return;
            }
        }

        filteredItems.push(navItem);
    });

    return filteredItems;
};

