import { Request, Response } from 'express';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IPerformanceService } from '../../services/interfaces/i-performance.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/performance')
export class PerformanceController {
    constructor(@inject('IPerformanceService') private performanceService: IPerformanceService) { }

    @httpGet('/overview')
    async getPerformanceOverview(req: Request, res: Response) {
        const result = await this.performanceService.getPerformanceOverview(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/employees')
    async getEmployeesPerformance(req: Request, res: Response) {
        const result = await this.performanceService.getEmployeesPerformance(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/departments')
    async getDepartmentsPerformance(req: Request, res: Response) {
        const result = await this.performanceService.getDepartmentsPerformance();
        res.json(ApiResponse.success(result));
    }

    @httpGet('/recommendations')
    async getPerformanceRecommendations(req: Request, res: Response) {
        const employeeId = req.query.employee_id as string | undefined;
        const result = await this.performanceService.getPerformanceRecommendations(employeeId);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/employees/:employeeId')
    async getEmployeePerformanceDetail(req: Request, res: Response) {
        const result = await this.performanceService.getEmployeePerformanceDetail(req.params.employeeId);
        res.json(ApiResponse.success(result));
    }
}
