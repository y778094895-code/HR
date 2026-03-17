import { Request, Response, NextFunction } from 'express';

import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IReportsService } from '../../services/interfaces/i-reports.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/reports')
export class ReportsController {
    constructor(@inject('IReportsService') private reportsService: IReportsService) { }

    @httpGet('/templates')
    async getTemplates(req: Request, res: Response) {
        const result = await this.reportsService.getTemplates();
        res.json(ApiResponse.success(result));
    }

    @httpPost('/jobs')
    async requestReport(req: Request, res: Response) {
        const result = await this.reportsService.requestReport(req.body);
        res.status(202).json(ApiResponse.success(result));
    }

    @httpGet('/jobs/:jobId')
    async getReportStatus(req: Request, res: Response) {
        const result = await this.reportsService.getReportStatus(req.params.jobId);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/jobs/:jobId/complete')
    async completeReport(req: Request, res: Response, next: NextFunction) {
        const correlationId = (req as any).correlationId;
        const userId = (req as any).user?.id || req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'User ID required', undefined, { correlationId }));
        }

        try {
            const result = await this.reportsService.completeReport(req.params.jobId, userId);
            res.json(ApiResponse.success(result, 'Report completed', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            if (error.message.includes('Can only complete')) {
                return res.status(409).json(ApiResponse.error('CONFLICT', error.message, undefined, { correlationId }));
            }
            next(error);
        }
    }

    @httpGet('/jobs/:jobId/download')
    async downloadReport(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.reportsService.getReportDownloadStream(req.params.jobId);
            const { stream, format, filename } = result;

            let contentType = 'application/octet-stream';
            if (format === 'csv') contentType = 'text/csv';
            if (format === 'pdf') contentType = 'application/pdf';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            stream.pipe(res);
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            if (error.message.includes('not available') || error.message.includes('not ready') || error.message.includes('requires persisted output')) {
                return res.status(404).json(ApiResponse.error('ARTIFACT_UNAVAILABLE', error.message, undefined, { correlationId }));
            }
            next(error);
        }
    }
}

