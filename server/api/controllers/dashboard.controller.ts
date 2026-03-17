import { Request, Response } from 'express';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ApiResponse } from '../../shared/api-response';
import { DashboardService } from '../../services/application/dashboard.service';

@controller('/dashboard')
export class DashboardController {
    constructor(
        @inject(DashboardService) private dashboardService: DashboardService
    ) { }

    @httpGet('/stats')
    async getStats(req: Request, res: Response) {
        try {
            const data = await this.dashboardService.getStats();
            res.json(ApiResponse.success(data));
        } catch (error: any) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    @httpGet('/')
    async getDashboard(req: Request, res: Response) {
        return this.getStats(req, res);
    }

    @httpGet('/kpis')
    async getKpis(req: Request, res: Response) {
        try {
            const data = await this.dashboardService.getStats();
            res.json(ApiResponse.success(data.kpis));
        } catch (error: any) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    @httpGet('/trends')
    async getTrends(req: Request, res: Response) {
        try {
            const data = await this.dashboardService.getStats();
            res.json(ApiResponse.success(data.trends));
        } catch (error: any) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }
}
