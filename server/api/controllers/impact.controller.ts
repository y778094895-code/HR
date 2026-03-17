import { Request, Response } from 'express';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IImpactService } from '../../services/interfaces/i-impact.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/impact')
export class ImpactController {
    constructor(@inject('IImpactService') private impactService: IImpactService) { }

    @httpGet('/')
    async getRoot(req: Request, res: Response) {
        const result = await this.impactService.getOverview(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/overview')
    async getOverview(req: Request, res: Response) {
        const result = await this.impactService.getOverview(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/employee/:employeeId')
    async getEmployeeImpact(req: Request, res: Response) {
        const result = await this.impactService.getEmployeeImpact(req.params.employeeId);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/department/:department')
    async getDepartmentImpact(req: Request, res: Response) {
        const result = await this.impactService.getDepartmentImpact(req.params.department);
        res.json(ApiResponse.success(result));
    }
}
