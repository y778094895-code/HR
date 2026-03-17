import { injectable, inject } from 'inversify';
import { IReportsService } from '../interfaces/i-reports.service';
import { ReportsRepository } from '../../data/repositories/reports.repository';
import { reportDefinitions } from '../../data/models/alerts-reports.schema';
import { eq } from 'drizzle-orm';
import { Readable } from 'stream';
import { OutboxService } from '../../shared/infrastructure/outbox.service';
import type { ReportRun } from '../../data/models/alerts-reports.schema';

@injectable()
export class ReportsService implements IReportsService {
    constructor(
        @inject('ReportsRepository') private reportsRepo: ReportsRepository,
        @inject('OutboxService') private outboxService: OutboxService
    ) { }


    async getTemplates(): Promise<any[]> {
        const templates = await this.reportsRepo.getTemplates();
        return templates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            type: 'standard', // Phase C limited
            required_params: ['period'] // Generic
        }));
    }

    async requestReport(config: any): Promise<any> {
        const { templateId, params = {}, requestedBy } = config;

        // Validate template exists
        const templates = await this.reportsRepo.getTemplates();
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            throw new Error('Invalid template ID');
        }

        const runData = {
            definitionId: templateId,
            status: 'processing',
        } as any;

        const run = await this.reportsRepo.createRun(runData);
        if (!run || !run.id) {
            throw new Error('Failed to create report run - DB insert failed');
        }

        return {
            jobId: run.id,
            status: run.status,
            message: 'Report job created and processing started',
            template: template.name
        };
    }

    async getReportStatus(jobId: string): Promise<any> {
        const result = await this.reportsRepo.getRunWithLatestOutput(jobId);
        if (!result) {
            throw new Error('Report job not found');
        }

        const { run, output } = result as any;
        const isComplete = run.status === 'completed';
        const hasOutput = !!output && output.status === 'available';

        return {
            jobId: run.id,
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt || null,
            isComplete,
            hasOutput,
            downloadUrl: hasOutput ? `/api/reports/jobs/${jobId}/download` : null,
            progress: run.status === 'completed' ? 100 : run.status === 'processing' ? 50 : 0
        };
    }


    async completeReport(jobId: string, userId: string): Promise<{ success: boolean; jobId: string; message: string }> {
        const result = await this.reportsRepo.getRunWithLatestOutput(jobId);
        if (!result || result.run.status !== 'processing') {
            throw new Error('Can only complete processing jobs');
        }

        const finishedAt = new Date();
        await this.reportsRepo.updateRunStatus(jobId, 'completed', finishedAt);
        const objectKey = `phase-d-metadata/${jobId}.json`;
        await this.reportsRepo.createOutput(jobId, 'json', objectKey);

        await this.outboxService.storeEvent('notification', 'report:completed', {
            jobId,
            userId,
            finishedAt: finishedAt.toISOString(),
            artifactKey: objectKey,
            type: 'metadata-proof'
        });

        return {
            success: true,
            jobId,
            message: 'Report completed with persisted metadata artifact and outbox delivery proof'
        };
    }

    async getReportDownloadStream(jobId: string): Promise<{ stream: Readable; format: string; filename: string }> {
        const result = await this.reportsRepo.getRunWithLatestOutput(jobId);
        if (!result || !result.output || result.output.status !== 'available') {
            throw new Error('Report artifact not available - requires persisted output record');
        }

        const { output } = result as any;
        const metadata = {
            status: 'phase-d-metadata-only',
            objectKey: output.objectKey,
            message: 'Backend Phase D: Persisted artifact metadata proof (no binary generation)',
            schemaVersion: '1.0',
            generatedAt: output.generatedAt,
            format: output.format
        };

        const { Readable } = await import('stream');
        const stream = new Readable({
            read() {
                this.push(JSON.stringify(metadata, null, 2));
                this.push(null);
            }
        });

        return {
            stream,
            format: output.format,
            filename: `report-${jobId}.${output.format}`
        };
    }
}


