import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ITrainingService } from '../../services/interfaces/i-training.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/training')
export class TrainingController {
    constructor(@inject('ITrainingService') private trainingService: ITrainingService) { }

    @httpGet('/skills/:employeeId/gaps')
    async getSkillGaps(req: Request, res: Response) {
        const result = await this.trainingService.getSkillGaps(req.params.employeeId);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/recommendations')
    async getRecommendations(req: Request, res: Response) {
        const result = await this.trainingService.getRecommendations(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/recommendations/:id/approve')
    async approveRecommendation(req: Request, res: Response) {
        await this.trainingService.approveRecommendation(req.params.id);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpPost('/recommendations/:id/reject')
    async rejectRecommendation(req: Request, res: Response) {
        await this.trainingService.rejectRecommendation(req.params.id, req.body.reason);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpGet('/effectiveness')
    async getTrainingEffectiveness(req: Request, res: Response) {
        // req.query.program_id might be single value or array, we pick string
        const programId = req.query.program_id as string | undefined;
        const result = await this.trainingService.getTrainingEffectiveness(programId);
        res.json(ApiResponse.success(result));
    }
}
