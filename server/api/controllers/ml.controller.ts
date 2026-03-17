import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IMLServiceClient } from '../../services/interfaces/i-ml.service.client';
import { ApiResponse } from '../../shared/api-response';

@controller('/ml')
export class MLController {
    constructor(@inject('IMLServiceClient') private mlServiceClient: IMLServiceClient) { }

    @httpGet('/health')
    async getHealth(_req: Request, res: Response) {
        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        res.json(ApiResponse.success({ ml_service_url: mlUrl, status: 'reachable' }));
    }

    @httpPost('/predictions/turnover')
    async predictTurnover(req: Request, res: Response) {
        const { employee_id, features } = req.body;
        const result = await this.mlServiceClient.predictTurnover(employee_id, features);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/predictions/batch')
    async predictTurnoverBatch(req: Request, res: Response) {
        const { employee_ids } = req.body;
        const result = await this.mlServiceClient.predictTurnoverBatch(employee_ids);
        res.json(ApiResponse.success(result));
    }
}
