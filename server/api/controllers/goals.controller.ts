import { inject } from 'inversify';
import {
  controller, httpGet, httpPost, httpPatch, httpDelete, requestParam, requestBody,
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { GoalsService } from '../../services/business/goals.service';
import { sendSuccess, sendError } from '../../shared/http/response.helper';

@controller('/v1/goals')
export class GoalsController {
  constructor(@inject(GoalsService) private readonly goalsService: GoalsService) {}

  @httpGet('/', 'AuthMiddleware', 'RbacMiddleware')
  async list(req: Request, res: Response) {
    const employeeId = (req as any).user?.employeeId;
    if (!employeeId) return sendError(res, 'MISSING_PARAM', 'employeeId required', 400);
    const goals = await this.goalsService.getByEmployee(employeeId);
    return sendSuccess(res, goals);
  }

  @httpGet('/:id', 'AuthMiddleware', 'RbacMiddleware')
  async getOne(@requestParam('id') id: string, res: Response) {
    const goal = await this.goalsService.getById(id);
    if (!goal) return sendError(res, 'NOT_FOUND', 'Goal not found', 404);
    return sendSuccess(res, goal);
  }

  @httpPost('/', 'AuthMiddleware', 'RbacMiddleware')
  async create(@requestBody() body: any, req: Request, res: Response) {
    try {
      const goal = await this.goalsService.create(body, (req as any).user?.id);
      return sendSuccess(res, goal, 201);
    } catch (err: any) {
      return sendError(res, 'VALIDATION_ERROR', err.message, 422);
    }
  }

  @httpPatch('/:id', 'AuthMiddleware', 'RbacMiddleware')
  async update(@requestParam('id') id: string, @requestBody() body: any, req: Request, res: Response) {
    try {
      const goal = await this.goalsService.update(id, body, (req as any).user?.id);
      if (!goal) return sendError(res, 'NOT_FOUND', 'Goal not found', 404);
      return sendSuccess(res, goal);
    } catch (err: any) {
      return sendError(res, 'VALIDATION_ERROR', err.message, 422);
    }
  }

  @httpDelete('/:id', 'AuthMiddleware', 'RbacMiddleware')
  async archive(@requestParam('id') id: string, res: Response) {
    const goal = await this.goalsService.archive(id);
    if (!goal) return sendError(res, 'NOT_FOUND', 'Goal not found', 404);
    return sendSuccess(res, goal);
  }

  // ── KPI sub-routes ──────────────────────────────────────────────────────────

  @httpPost('/:id/kpis', 'AuthMiddleware', 'RbacMiddleware')
  async addKpi(@requestParam('id') goalId: string, @requestBody() body: any, res: Response) {
    try {
      const kpi = await this.goalsService.addKpi(goalId, body);
      return sendSuccess(res, kpi, 201);
    } catch (err: any) {
      return sendError(res, 'VALIDATION_ERROR', err.message, 422);
    }
  }

  @httpPatch('/:id/kpis/:kpiId', 'AuthMiddleware', 'RbacMiddleware')
  async updateKpi(
    @requestParam('id') goalId: string,
    @requestParam('kpiId') kpiId: string,
    @requestBody() body: any,
    res: Response,
  ) {
    const kpi = await this.goalsService.updateKpi(goalId, kpiId, body);
    return sendSuccess(res, kpi);
  }

  @httpDelete('/:id/kpis/:kpiId', 'AuthMiddleware', 'RbacMiddleware')
  async deleteKpi(
    @requestParam('id') goalId: string,
    @requestParam('kpiId') kpiId: string,
    res: Response,
  ) {
    await this.goalsService.deleteKpi(goalId, kpiId);
    res.status(204).end();
  }
}

@controller('/v1/objectives')
export class OrgObjectivesController {
  constructor(@inject(GoalsService) private readonly goalsService: GoalsService) {}

  @httpGet('/', 'AuthMiddleware', 'RbacMiddleware')
  async list(res: Response) {
    return sendSuccess(res, await this.goalsService.getObjectives());
  }

  @httpPost('/', 'AuthMiddleware', 'RbacMiddleware')
  async create(@requestBody() body: any, res: Response) {
    return sendSuccess(res, await this.goalsService.createObjective(body), 201);
  }

  @httpPost('/:id/cascade', 'AuthMiddleware', 'RbacMiddleware')
  async cascade(@requestParam('id') id: string, @requestBody() body: any, res: Response) {
    const result = await this.goalsService.cascadeObjective(id, body.departmentIds ?? []);
    return sendSuccess(res, result);
  }
}
