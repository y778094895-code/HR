// ============================================================
// Data Quality Service
//
// Attempts to fetch quality data from available APIs.
// Falls back gracefully when endpoints are unavailable.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import type {
    QualityIssue,
    QualitySummary,
    QualitySource,
    QualityIssueFilters,
    QualityScanResult,
    SourceHealth,
    QualitySeverity,
    QualityIssueStatus,
    QualityIssueCategory
} from '../../types/dataQuality';
import { createDefaultQualitySummary } from '@/utils/factories';

const coerceQualitySummary = (data: any): QualitySummary => {
    const defaults = createDefaultQualitySummary();
    if (!data) return defaults;
    
    return {
        ...defaults,
        ...data,
        sources: Array.isArray(data.sources) ? data.sources : [],
        lastScanDate: data.lastScanDate || defaults.lastScanDate,
    };
};

class DataQualityService {
    /**
     * Get quality issues - attempts to use quality-specific endpoint,
     * falls back to filtering alerts by DATA_QUALITY type
     */
    async getQualityIssues(filters?: QualityIssueFilters): Promise<QualityIssue[]> {
        try {
            // Try quality-specific endpoint first
            const raw = await apiClient.get<unknown[]>('/quality/issues', { 
                params: filters 
            });
            return normalizeKeys<QualityIssue[]>(raw);
        } catch {
            // Fallback: try to get DATA_QUALITY alerts as quality issues
            try {
                const raw = await apiClient.get<unknown[]>('/alerts', {
                    params: { type: 'DATA_QUALITY' }
                });
                const alerts = normalizeKeys<any[]>(raw);
                return this.convertAlertsToQualityIssues(alerts);
            } catch {
                // Return empty array - no backend data available
                return [];
            }
        }
    }

    /**
     * Get quality summary/metrics
     */
    async getQualitySummary(): Promise<QualitySummary> {
        try {
            const raw = await apiClient.get<unknown>('/quality/summary');
            return coerceQualitySummary(normalizeKeys<any>(raw));
        } catch {
            // Return empty summary with default values - marked as fallback
            return createDefaultQualitySummary();
        }
    }

    /**
     * Get list of data sources with health info
     */
    async getQualitySources(): Promise<QualitySource[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/quality/sources');
            return normalizeKeys<QualitySource[]>(raw);
        } catch {
            // Return default sources
            return this.getDefaultSources();
        }
    }

    /**
     * Get source health status
     */
    async getSourceHealth(sourceId?: string): Promise<SourceHealth[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/quality/health', {
                params: sourceId ? { sourceId } : undefined
            });
            return normalizeKeys<SourceHealth[]>(raw);
        } catch {
            return [];
        }
    }

    /**
     * Trigger a quality scan/recheck
     */
    async triggerScan(): Promise<QualityScanResult | null> {
        try {
            const raw = await apiClient.post<unknown>('/quality/scan');
            return normalizeKeys<QualityScanResult>(raw);
        } catch {
            return null;
        }
    }

    /**
     * Update issue status (acknowledge, resolve, ignore)
     */
    async updateIssueStatus(
        issueId: string, 
        status: QualityIssueStatus
    ): Promise<QualityIssue | null> {
        try {
            const raw = await apiClient.patch<unknown>(`/quality/issues/${issueId}`, {
                status
            });
            return normalizeKeys<QualityIssue>(raw);
        } catch {
            // Try via alerts API
            try {
                await apiClient.post(`/alerts/${issueId}/action`, {
                    action: status === 'resolved' ? 'close' : 'acknowledge'
                });
                return null;
            } catch {
                return null;
            }
        }
    }

    /**
     * Get quality issues by category
     */
    async getIssuesByCategory(category: QualityIssueCategory): Promise<QualityIssue[]> {
        return this.getQualityIssues({ category, status: 'open' });
    }

    /**
     * Convert DATA_QUALITY alerts to QualityIssue format
     */
    private convertAlertsToQualityIssues(alerts: any[]): QualityIssue[] {
        if (!Array.isArray(alerts)) return [];
        
        return alerts.map(alert => ({
            id: alert.id,
            field: alert.title || 'Unknown Field',
            description: alert.description,
            category: this.mapAlertTypeToCategory(alert.type),
            severity: this.mapAlertSeverityToQuality(alert.severity),
            affectedRows: alert.affectedRows || 1,
            status: this.mapAlertStatusToQuality(alert.status),
            sourceName: alert.department || 'General',
            createdAt: alert.triggeredAt,
            updatedAt: alert.readAt,
            resolvedAt: alert.resolvedAt
        }));
    }

    private mapAlertSeverityToQuality(severity: string): QualitySeverity {
        switch (severity?.toUpperCase()) {
            case 'CRITICAL': return 'critical';
            case 'HIGH': return 'high';
            case 'MEDIUM': return 'medium';
            default: return 'low';
        }
    }

    private mapAlertStatusToQuality(status: string): QualityIssueStatus {
        switch (status?.toUpperCase()) {
            case 'NEW': return 'open';
            case 'ACKNOWLEDGED': return 'acknowledged';
            case 'CLOSED':
            case 'ARCHIVED': return 'resolved';
            default: return 'open';
        }
    }

    private mapAlertTypeToCategory(type: string): QualityIssueCategory {
        switch (type?.toUpperCase()) {
            case 'DATA_QUALITY': return 'missing_data';
            default: return 'invalid_data';
        }
    }

    private getEmptySummary(): QualitySummary {
        return {
            totalIssues: 0,
            criticalIssues: 0,
            highIssues: 0,
            mediumIssues: 0,
            lowIssues: 0,
            openIssues: 0,
            resolvedIssues: 0,
            completionRate: 0,
            sources: []
        };
    }

    private getDefaultSources(): QualitySource[] {
        return [
            { id: 'employees', name: 'Employee Records', type: 'employee', healthScore: 100, issueCount: 0 },
            { id: 'performance', name: 'Performance Data', type: 'performance', healthScore: 95, issueCount: 0 },
            { id: 'attendance', name: 'Attendance Records', type: 'attendance', healthScore: 98, issueCount: 0 },
            { id: 'payroll', name: 'Payroll Data', type: 'payroll', healthScore: 92, issueCount: 0 },
            { id: 'training', name: 'Training Records', type: 'training', healthScore: 88, issueCount: 0 }
        ];
    }
}

export const dataQualityService = new DataQualityService();
export default dataQualityService;

