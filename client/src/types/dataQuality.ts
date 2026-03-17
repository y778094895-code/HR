// ============================================================
// Data Quality Center — Domain Types
// ============================================================

/** Severity level for quality issues */
export type QualitySeverity = 'critical' | 'high' | 'medium' | 'low';

/** Status of a quality issue */
export type QualityIssueStatus = 'open' | 'acknowledged' | 'resolved' | 'ignored';

/** Category of quality issue */
export type QualityIssueCategory = 
    | 'missing_data'
    | 'invalid_data'
    | 'inconsistent_data'
    | 'schema_mismatch'
    | 'duplicate'
    | 'stale_data';

/** Source/system that the quality issue relates to */
export interface QualitySource {
    id: string;
    name: string;
    type: 'employee' | 'performance' | 'attendance' | 'payroll' | 'training' | 'general';
    healthScore?: number;
    lastChecked?: string;
    issueCount?: number;
}

/** A single quality issue found in the data */
export interface QualityIssue {
    id: string;
    field: string;
    table?: string;
    description: string;
    category: QualityIssueCategory;
    severity: QualitySeverity;
    affectedRows: number;
    status: QualityIssueStatus;
    sourceId?: string;
    sourceName?: string;
    createdAt: string;
    updatedAt?: string;
    resolvedAt?: string | null;
    createdBy?: string;
    notes?: string;
}

/** Summary of data quality metrics */
export interface QualitySummary {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    openIssues: number;
    resolvedIssues: number;
    completionRate: number;
    lastScanDate?: string;
    sources: QualitySource[];
}

/** Filter parameters for quality issues */
export interface QualityIssueFilters {
    severity?: QualitySeverity | 'all';
    status?: QualityIssueStatus | 'all';
    category?: QualityIssueCategory | 'all';
    sourceId?: string | 'all';
    search?: string;
    sortBy?: 'severity' | 'createdAt' | 'affectedRows' | 'status';
    sortOrder?: 'asc' | 'desc';
}

/** Response for quality scan/recheck */
export interface QualityScanResult {
    scanId: string;
    startedAt: string;
    completedAt?: string;
    status: 'running' | 'completed' | 'failed';
    issuesFound: number;
    issuesResolved: number;
}

/** Health status of a data source */
export interface SourceHealth {
    sourceId: string;
    sourceName: string;
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    healthScore: number;
    issuesBySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    lastChecked: string;
}

