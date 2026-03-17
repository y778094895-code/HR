import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IAlertsService } from '../../services/interfaces/i-alerts.service';
import { ApiResponse } from '../../shared/api-response';
import { parseCanonicalQuery } from '../../shared/http/contracts';

@controller('/alerts')
export class AlertsController {
    constructor(@inject('IAlertsService') private alertsService: IAlertsService) { }

    @httpGet('/')
    async getAlerts(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const query = parseCanonicalQuery(req.query);
            const result = await this.alertsService.getAlerts({
                ...query.filters,
                search: query.search,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder,
                page: query.page,
                pageSize: query.pageSize,
            });
            res.json(ApiResponse.success(result, 'Success', { correlationId }));
        } catch (error) {
            next(error);
        }
    }


    @httpGet('/:id')
    async getAlertDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const result = await this.alertsService.getAlertDetails(req.params.id);
            res.json(ApiResponse.success(result, 'Success', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            if (error?.message === 'Alert not found') {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Alert not found', undefined, { correlationId }));
            }
            next(error);
        }
    }

    @httpGet('/:id/details')
    async getAlertDetailsByPath(req: Request, res: Response, next: NextFunction) {
        return this.getAlertDetails(req, res, next);
    }
    @httpPost('/:id/action')
    async logAction(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const action = req.body?.action;
            if (!action || typeof action !== 'string') {
                return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'Action is required', undefined, { correlationId }));
            }

            const userId = (req as any).user?.id || (req as any).user?.sub || req.body?.userId;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'userId is required', undefined, { correlationId }));
            }

            const result = await this.alertsService.logAlertAction(req.params.id, action, String(userId), req.body || {});
            res.status(201).json(ApiResponse.success(result, 'Created', { correlationId }));
        } catch (error: any) {
            const correlationId = (req as any).correlationId;
            if (error?.message === 'Alert not found') {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Alert not found', undefined, { correlationId }));
            }
            next(error);
        }
    }
}

