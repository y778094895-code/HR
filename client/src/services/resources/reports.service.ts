// ============================================================
// Reports Service (PR-02)
//
// All local interfaces now use camelCase, aligned to PR-01 naming.
// Transport normalization via normalizeKeys at every response.
// Binary download is unchanged (no keys to normalize).
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { ReportConfig, ReportResult } from './types';

// ---- Frontend-safe interfaces (camelCase, PR-01 aligned) ----

export interface ReportTemplateSummary {
    id: string;
    name: string;
    description: string;
    type: 'performance' | 'turnover' | 'fairness' | 'audit';
    requiredParams: string[];
}

export interface ReportJob {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: ReportResult;
    error?: string;
}

// ---- Service ----

class ReportsService {
    /**
     * Get available report templates
     */
    async getTemplates(): Promise<ReportTemplateSummary[]> {
        const raw = await apiClient.get<unknown[]>('/reports/templates');
        const normalized = normalizeKeys<ReportTemplateSummary[]>(raw);
        // Always return an array - defensive against null/malformed responses
        return Array.isArray(normalized) ? normalized : [];
    }

    /**
     * Request a new report generation
     */
    async requestReport(config: ReportConfig): Promise<ReportJob> {
        const raw = await apiClient.post<unknown>('/reports/jobs', config);
        return normalizeKeys<ReportJob>(raw);
    }

    /**
     * Get status of a report job
     */
    async getReportStatus(jobId: string): Promise<ReportJob> {
        const raw = await apiClient.get<unknown>(`/reports/jobs/${jobId}`);
        return normalizeKeys<ReportJob>(raw);
    }

    /**
     * Download a completed report as a file
     */
    async downloadReport(jobId: string, filename: string = 'report.pdf'): Promise<void> {
        const blob = await apiClient.download(`/reports/jobs/${jobId}/download`);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Helper: Poll for report completion
     * Returns the completed job or throws error/timeout
     */
    async pollReport(jobId: string, intervalMs: number = 2000, maxAttempts: number = 30): Promise<ReportJob> {
        let attempts = 0;

        const checkStatus = async (): Promise<ReportJob> => {
            const job = await this.getReportStatus(jobId);

            if (job.status === 'completed') {
                return job;
            }

            if (job.status === 'failed') {
                throw new Error(job.error || 'Report generation failed');
            }

            if (attempts >= maxAttempts) {
                throw new Error('Report generation timed out');
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            return checkStatus();
        };

        return checkStatus();
    }
}

export const reportsService = new ReportsService();
