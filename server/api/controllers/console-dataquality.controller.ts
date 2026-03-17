import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ApiResponse } from '../../shared/api-response';
import { DataQualityService } from '../../services/business/dataquality.service';

@controller('/quality')
export class ConsoleDataQualityController {
    constructor(
        @inject('DataQualityService') private dataQualityService: DataQualityService
    ) {}

    @httpGet('/')
    async getRoot(_req: Request, res: Response) {
        const summary = await this.dataQualityService.getSummary();
        res.json(ApiResponse.success(summary));
    }

    @httpGet('/summary')
    async getSummary(_req: Request, res: Response) {
        const summary = await this.dataQualityService.getSummary();
        res.json(ApiResponse.success(summary));
    }

    @httpGet('/issues')
    async listIssues(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 50;
        const issues = await this.dataQualityService.listIssues(limit);
        res.json(ApiResponse.success(issues));
    }

    @httpPost('/issues/:id/acknowledge')
    async acknowledgeIssue(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const id = req.params.id;
        const updated = await this.dataQualityService.acknowledgeIssue(id, userId);
        res.json(ApiResponse.success(updated));
    }

    @httpPost('/issues/:id/resolve')
    async resolveIssue(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const id = req.params.id;
        const updated = await this.dataQualityService.resolveIssue(id, userId);
        res.json(ApiResponse.success(updated));
    }

    @httpGet('/sources')
    async getSources(req: Request, res: Response) {
        const sources = await this.dataQualityService.getSources();
        res.json(ApiResponse.success(sources));
    }

    @httpGet('/sources/health')
    async getSourceHealth(req: Request, res: Response) {
        const health = await this.dataQualityService.getSourceHealth();
        res.json(ApiResponse.success(health));
    }

    @httpPatch('/issues/:id')
    async updateIssueStatus(req: Request, res: Response) {
        const id = req.params.id;
        const { status } = req.body;
        const updated = await this.dataQualityService.updateIssueStatus(id, status);
        res.json(ApiResponse.success(updated));
    }

    @httpPost('/scan')
    async triggerScan(req: Request, res: Response) {
        const result = await this.dataQualityService.triggerScan();
        res.json(ApiResponse.success(result, 'Scan triggered persisted'));
    }

    @httpPost('/recheck/:sourceId')
    async triggerRecheck(req: Request, res: Response) {
        const sourceId = req.params.sourceId;
        const result = await this.dataQualityService.triggerRecheck(sourceId);
        res.json(ApiResponse.success(result, 'Recheck triggered persisted'));
    }

}
