// ============================================================
// Reports Domain — Unified Types (PR-01)
// ============================================================

/** Structure of a report template */
export interface ReportTemplate {
    /** Ordered section identifiers included in the report */
    sections: string[];
    /** Optional filter configuration for the report */
    filters?: Record<string, any>;
    /** Layout style (e.g. 'tabular', 'narrative', 'dashboard') */
    layout?: string;
}

/** Parameters for generating a report */
export interface ReportParameters {
    /** ISO date for the start of the reporting period */
    periodStart?: string;
    /** ISO date for the end of the reporting period */
    periodEnd?: string;
    /** Department filters */
    departments?: string[];
    /** Output format override */
    format?: string;
    /** Extensible additional parameters */
    [key: string]: any;
}

/** Saved report definition / template */
export interface ReportDefinition {
    id: string;
    name: string;
    description?: string;
    /** Structured template configuration */
    templateJson?: ReportTemplate;
    /** ISO timestamp of creation */
    createdAt: string;
}

/** A single execution run of a report */
export interface ReportRun {
    id: string;
    definitionId: string;
    requestedBy?: string;
    status: 'processing' | 'completed' | 'failed';
    /** ISO timestamp of when the run started */
    startedAt: string;
    /** ISO timestamp of when the run finished */
    finishedAt?: string;
}

/** Generated output artifact from a report run */
export interface ReportOutput {
    id: string;
    runId: string;
    format: string;
    /** ISO date for the start of the reported period */
    periodStart?: string;
    /** ISO date for the end of the reported period */
    periodEnd?: string;
    storageProvider: string;
    objectKey: string;
    /** ISO timestamp of generation */
    generatedAt: string;
    status: string;
}

/** Configuration for requesting a new report generation */
export interface ReportConfig {
    templateId: string;
    format: 'pdf' | 'csv' | 'xlsx';
    /** Typed parameters for the report run */
    parameters: ReportParameters;
}

/** Result payload returned after report generation */
export interface ReportResult {
    downloadUrl: string;
    previewUrl?: string;
    summary?: string;
}
