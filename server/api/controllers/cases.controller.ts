import { Request, Response, NextFunction } from 'express';
import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { RiskCaseRepository } from '../../data/repositories/riskCase.repository';
import { ApiResponse } from '../../shared/api-response';

@controller('/cases')
export class CasesController {
    constructor(
        @inject('RiskCaseRepository') private riskCaseRepo: RiskCaseRepository
    ) {}

    @httpGet('/')
    async listCases(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const cases = await this.riskCaseRepo.findAll(limit, offset);
            res.json(ApiResponse.success(cases));
        } catch (error) {
            next(error);
        }
    }
}
