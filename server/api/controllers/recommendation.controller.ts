import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IRecommendationService } from '../../services/interfaces/i-recommendation.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/recommendations')
export class RecommendationController {
    constructor(@inject('IRecommendationService') private recommendationService: IRecommendationService) { }

    @httpGet('/')
    async getRecommendations(req: Request, res: Response) {
        const result = await this.recommendationService.getRecommendations(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/:id')
    async getRecommendationById(req: Request, res: Response) {
        const result = await this.recommendationService.getRecommendationById(req.params.id);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/generate/batch')
    async generateBatch(req: Request, res: Response) {
        const result = await this.recommendationService.generateBatch(req.body);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/generate/:employeeId')
    async generateForEmployee(req: Request, res: Response) {
        const result = await this.recommendationService.generateForEmployee(
            req.params.employeeId,
            req.body.focusArea
        );
        res.json(ApiResponse.success(result));
    }

    @httpPost('/:id/accept')
    async acceptRecommendation(req: Request, res: Response) {
        await this.recommendationService.acceptRecommendation(req.params.id);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpPost('/:id/reject')
    async rejectRecommendation(req: Request, res: Response) {
        await this.recommendationService.rejectRecommendation(req.params.id, req.body.reason);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpPost('/:id/apply')
    async applyRecommendation(req: Request, res: Response) {
        await this.recommendationService.applyRecommendation(req.params.id);
        res.json(ApiResponse.success({ success: true }));
    }

    // Legacy or generic handler
    @httpPost('/:id/:action')
    async handleRecommendationAction(req: Request, res: Response) {
        const action = req.params.action;
        let p;
        if (action === 'accept') {
            p = this.recommendationService.acceptRecommendation(req.params.id);
        } else if (action === 'reject') {
            p = this.recommendationService.rejectRecommendation(req.params.id, req.body.reason);
        } else if (action === 'apply') {
            p = this.recommendationService.applyRecommendation(req.params.id);
        } else {
            return res.status(400).json(ApiResponse.error('Invalid action'));
        }
        await p;
        res.json(ApiResponse.success({ success: true }));
    }
}
