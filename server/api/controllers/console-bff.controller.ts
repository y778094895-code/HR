import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ProfileAggregatorService } from '../../services/business/profile-aggregator.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/console/v1/employees')
export class ConsoleBffController {
    constructor(
        @inject('ProfileAggregatorService') private profileAggregatorService: ProfileAggregatorService
    ) { }

    // Ex: GET /api/console/v1/employees/EMP-1002/profile?tabs=overview,performance
    @httpGet('/:id/profile')
    async getEmployeeProfile(req: Request, res: Response, next: NextFunction) {
        try {
            // In a real app, userRole and actorId would come from req.user (Auth middleware)
            const userRole = (req as any).user?.role || 'HR';

            const result = await this.profileAggregatorService.getProfileAggregate(
                req.params.id,
                req.query,
                userRole
            );

            res.json(ApiResponse.success(result));
        } catch (error) {
            next(error);
        }
    }

    @httpGet('/:id/risk')
    async getEmployeeRisk(req: Request, res: Response, next: NextFunction) {
        try {
            const userRole = (req as any).user?.role || 'HR';
            const result = await this.profileAggregatorService.getRisk(req.params.id, userRole);
            res.json(ApiResponse.success(result));
        } catch (error) {
            next(error);
        }
    }

    @httpGet('/:id/timeline')
    async getEmployeeTimeline(req: Request, res: Response, next: NextFunction) {
        try {
            const userRole = (req as any).user?.role || 'HR';
            const result = await this.profileAggregatorService.getTimeline(req.params.id, userRole);
            res.json(ApiResponse.success(result));
        } catch (error) {
            next(error);
        }
    }

    @httpPost('/:id/cases')
    async createCase(req: Request, res: Response, next: NextFunction) {
        try {
            const userRole = (req as any).user?.role || 'HR';
            const actorId = (req as any).user?.id || 'SYSTEM';

            // Optional: Handle Idempotency-Key
            // const idempotencyKey = req.headers['idempotency-key'];

            const result = await this.profileAggregatorService.createCase(
                req.params.id,
                req.body,
                userRole,
                actorId
            );

            res.status(201).json(ApiResponse.success(result.data, 'Case created successfully'));
        } catch (error: any) {
            if (error.message && error.message.includes('not authorized')) {
                const correlationId = (req as any).correlationId;
                res.status(403).json(ApiResponse.error('PERMISSION_DENIED', error.message, undefined, { correlationId }));
            } else {
                next(error);
            }
        }
    }
}
