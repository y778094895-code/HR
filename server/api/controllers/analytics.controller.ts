import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestBody, requestParam } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { AnalyticsService, DashboardRole } from '../../services/business/analytics.service';
import { ExportService } from '../../services/business/export.service';
import { sendSuccess, sendError } from '../../shared/http/response.helper';

@controller('/analytics')
export class AnalyticsController {
    constructor(
        @inject(AnalyticsService) private readonly analyticsService: AnalyticsService,
        @inject(ExportService) private readonly exportService: ExportService,
    ) { }

    /**
     * GET /api/analytics/dashboard
     * Returns role-scoped KPIs. Role derived from JWT claim; cached 300 s in Redis.
     */
    @httpGet('/dashboard', 'AuthMiddleware')
    async getDashboard(req: Request, res: Response) {
        const user = (req as any).user;
        const role = (user?.role ?? 'employee') as DashboardRole;
        const data = await this.analyticsService.getDashboard(user?.id, role, user?.employeeId);
        return sendSuccess(res, data);
    }

    /**
     * GET /api/analytics/department/:id
     * Avg goal completion, avg review score, risk band distribution.
     */
    @httpGet('/department/:id', 'AuthMiddleware')
    async getDepartmentSummary(req: Request, res: Response) {
        const { id } = req.params;
        const data = await this.analyticsService.getDepartmentSummary(id);
        return sendSuccess(res, data);
    }

    /**
     * GET /api/analytics/export?type=employees|goals&format=csv|xlsx&employeeId=...
     * Streams CSV/XLSX file download.
     */
    @httpGet('/export', 'AuthMiddleware')
    async export(req: Request, res: Response) {
        const type = (req.query.type as string) ?? 'employees';
        const format = (req.query.format as 'csv' | 'xlsx') ?? 'csv';
        const employeeId = req.query.employeeId as string | undefined;

        try {
            if (type === 'goals') {
                await this.exportService.exportGoals(res, employeeId, format);
            } else {
                await this.exportService.exportEmployees(res, format);
            }
        } catch (err: any) {
            return sendError(res, 'EXPORT_ERROR', err.message, 500);
        }
    }

    // ── Fairness (T134) ───────────────────────────────────────────────────────

    /**
     * POST /api/analytics/fairness
     * Body: { attribute: string, cycleId?: string }
     * Calls ML service, persists run, returns result.
     */
    @httpPost('/fairness', 'AuthMiddleware', 'RbacMiddleware')
    async generateFairness(@requestBody() body: any, req: Request, res: Response) {
        try {
            const result = await this.analyticsService.generateFairnessReport({
                attribute: body.attribute ?? 'gender',
                cycleId: body.cycleId,
                createdBy: (req as any).user?.id,
            });
            return sendSuccess(res, result, 201);
        } catch (err: any) {
            return sendError(res, 'FAIRNESS_ERROR', err.message, 500);
        }
    }

    /** GET /api/analytics/fairness — list all fairness run summaries. */
    @httpGet('/fairness', 'AuthMiddleware')
    async listFairness(res: Response) {
        return sendSuccess(res, await this.analyticsService.listFairnessReports());
    }

    /** GET /api/analytics/fairness/:id — single run with metric values. */
    @httpGet('/fairness/:id', 'AuthMiddleware')
    async getFairness(@requestParam('id') id: string, res: Response) {
        const result = await this.analyticsService.getFairnessReport(id);
        if (!result) return sendError(res, 'NOT_FOUND', 'Fairness run not found', 404);
        return sendSuccess(res, result);
    }
}
