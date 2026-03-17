import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { TurnoverService } from '../../services/business/turnover.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/turnover')
export class TurnoverController {
    constructor(@inject('TurnoverService') private turnoverService: TurnoverService) { }

    @httpGet('/metrics')
    async getMetrics(req: Request, res: Response) {
        const result = await this.turnoverService.getMetrics();
        res.json(ApiResponse.success(result));
    }

    @httpGet('/risks')
    async getRiskList(req: Request, res: Response) {
        const result = await this.turnoverService.getRiskList(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/risks/:employeeId')
    async getRiskDetail(req: Request, res: Response) {
        const result = await this.turnoverService.getRiskDetail(req.params.employeeId);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/predict/:employeeId')
    async predictTurnover(req: Request, res: Response) {
        const result = await this.turnoverService.predictTurnover(req.params.employeeId);
        res.status(201).json(ApiResponse.success(result));
    }
}
