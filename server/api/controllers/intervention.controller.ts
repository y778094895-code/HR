import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IInterventionService } from '../../services/interfaces/i-intervention.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/interventions')
export class InterventionController {
    constructor(@inject('IInterventionService') private interventionService: IInterventionService) { }

    @httpGet('/')
    async getInterventions(req: Request, res: Response) {
        const result = await this.interventionService.getInterventions(req.query);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/analytics')
    async getAnalytics(req: Request, res: Response) {
        const result = await this.interventionService.getAnalytics();
        res.json(ApiResponse.success(result));
    }

    @httpGet('/:id')
    async getInterventionDetail(req: Request, res: Response) {
        const result = await this.interventionService.getInterventionDetail(req.params.id);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/')
    async createIntervention(req: Request, res: Response) {
        const result = await this.interventionService.createIntervention(req.body);
        res.status(201).json(ApiResponse.success(result));
    }

    @httpPatch('/:id/status')
    async updateStatus(req: Request, res: Response) {
        await this.interventionService.updateStatus(req.params.id, req.body.status);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpPost('/:id/log')
    async logAction(req: Request, res: Response) {
        await this.interventionService.logAction(req.params.id, req.body.action, req.body.notes);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpGet('/:id/history')
    async getHistory(req: Request, res: Response) {
        const result = await this.interventionService.getHistory(req.params.id);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/:id/assign')
    async assign(req: Request, res: Response) {
        await this.interventionService.assign(req.params.id, req.body.ownerId);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpPost('/:id/close')
    async close(req: Request, res: Response) {
        await this.interventionService.close(req.params.id, req.body.notes);
        res.json(ApiResponse.success({ success: true }));
    }
}
