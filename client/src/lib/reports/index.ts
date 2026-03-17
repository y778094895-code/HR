// ============================================================
// Reports Library - Helper Functions
// ============================================================

import { ReportParameters, ReportConfig } from '@/types/reports';

/**
 * Map legacy report types to template IDs
 */
export const REPORT_TYPE_MAPPING: Record<string, string> = {
    'performance': 'performance-summary',
    'attrition': 'attrition-analysis',
    'turnover': 'attrition-analysis',
    'training': 'training-effectiveness',
    'fairness': 'fairness-audit',
};

/**
 * Get template ID from report type
 */
export function getTemplateIdFromType(type: string): string {
    return REPORT_TYPE_MAPPING[type] || 'performance-summary';
}

/**
 * Map date range string to ISO dates
 */
export function getDateRangeFromPreset(preset: string): { periodStart: string; periodEnd: string } {
    const end = new Date();
    const start = new Date();

    switch (preset) {
        case 'last30':
            start.setDate(end.getDate() - 30);
            break;
        case 'last90':
            start.setDate(end.getDate() - 90);
            break;
        case 'ytd':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            break;
        default:
            start.setDate(end.getDate() - 30);
    }

    return {
        periodStart: start.toISOString().split('T')[0],
        periodEnd: end.toISOString().split('T')[0],
    };
}

/**
 * Build report config from form values
 */
export function buildReportConfig(
    type: string,
    format: 'pdf' | 'csv' | 'xlsx',
    dateRange: string,
    additionalParams?: Partial<ReportParameters>
): ReportConfig {
    const { periodStart, periodEnd } = getDateRangeFromPreset(dateRange);

    return {
        templateId: getTemplateIdFromType(type),
        format,
        parameters: {
            periodStart,
            periodEnd,
            ...additionalParams,
        },
    };
}

/**
 * Format date for display
 */
export function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get status display text
 */
export function getStatusDisplay(status: string): { label: string; variant: 'success' | 'warning' | 'error' | 'default' } {
    switch (status) {
        case 'completed':
            return { label: 'Ready', variant: 'success' };
        case 'processing':
        case 'pending':
            return { label: 'Processing', variant: 'warning' };
        case 'failed':
            return { label: 'Failed', variant: 'error' };
        default:
            return { label: 'Unknown', variant: 'default' };
    }
}

/**
 * Supported report categories based on available services
 */
export const REPORT_CATEGORIES = [
    {
        id: 'performance',
        label: 'Employee Performance',
        description: 'Performance scores, trends, and KPIs',
        icon: 'TrendingUp',
    },
    {
        id: 'turnover',
        label: 'Attrition & Retention',
        description: 'Turnover rates, risk analysis, and predictions',
        icon: 'UserMinus',
    },
    {
        id: 'training',
        label: 'Training & Skills',
        description: 'Training effectiveness and skill gaps',
        icon: 'GraduationCap',
    },
    {
        id: 'fairness',
        label: 'Fairness & Diversity',
        description: 'Demographic analysis and pay equity',
        icon: 'Scale',
    },
] as const;


