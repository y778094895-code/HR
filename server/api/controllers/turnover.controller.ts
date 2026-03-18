import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { TurnoverService } from '../../services/business/turnover.service';
import { ApiResponse } from '../../shared/api-response';
import { db } from '../../data/database/connection';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { eq } from 'drizzle-orm';

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

    /**
     * GET /turnover/risks/:employeeId
     * HR/Admin/Manager: always allowed.
     * Employee role: only allowed when showRiskToEmployee flag is true for that employee.
     */
    @httpGet('/risks/:employeeId')
    async getRiskDetail(req: Request, res: Response) {
        const user = (req as any).user;
        const { employeeId } = req.params;

        if (user?.role === 'EMPLOYEE') {
            // Find the employee and check the opt-in flag
            const [emp] = await db
                .select({ showRiskToEmployee: employeesLocal.showRiskToEmployee })
                .from(employeesLocal)
                .where(eq(employeesLocal.id, employeeId))
                .limit(1);

            if (!emp || !emp.showRiskToEmployee) {
                res.status(403).json(ApiResponse.error('Risk history is not available for this employee.'));
                return;
            }
        }

        const result = await this.turnoverService.getRiskDetail(employeeId);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/predict/:employeeId')
    async predictTurnover(req: Request, res: Response) {
        const result = await this.turnoverService.predictTurnover(req.params.employeeId);
        res.status(201).json(ApiResponse.success(result));
    }

    /**
     * POST /api/turnover/batch
     * Trigger batch re-scoring for stale employees (optionally filtered by department).
     * Returns 202 Accepted — processing happens asynchronously via RabbitMQ.
     */
    @httpPost('/batch')
    async batchPredict(req: Request, res: Response) {
        const { departmentId, staleOnly = true } = req.body as { departmentId?: string; staleOnly?: boolean };
        const result = await this.turnoverService.triggerBatchPrediction({ departmentId, staleOnly });
        res.status(202).json(ApiResponse.success(result));
    }
}
