import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IFairnessService } from '../../services/interfaces/i-fairness.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/fairness')
export class FairnessController {
    constructor(@inject('IFairnessService') private fairnessService: IFairnessService) { }

    @httpGet('/metrics')
    async getMetrics(req: Request, res: Response) {
        const result = await this.fairnessService.getMetrics(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/comparison')
    async getComparison(req: Request, res: Response) {
        const groupBy = req.query.groupBy as string || 'department';
        const result = await this.fairnessService.getComparison(groupBy);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/recommendations')
    async getRecommendations(req: Request, res: Response) {
        const result = await this.fairnessService.getRecommendations();
        res.json(ApiResponse.success(result));
    }

    @httpPost('/analyze')
    async analyzeDepartment(req: Request, res: Response) {
        const departmentId = req.body.departmentId;
        const result = await this.fairnessService.analyzeDepartment(departmentId);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/matrix')
    async getMatrix(req: Request, res: Response) {
        const result = await this.fairnessService.getMatrix();
        res.json(ApiResponse.success(result));
    }

    @httpGet('/gap-analysis')
    async getGapAnalysis(req: Request, res: Response) {
        const result = await this.fairnessService.getGapAnalysis();
        res.json(ApiResponse.success(result));
    }
}
