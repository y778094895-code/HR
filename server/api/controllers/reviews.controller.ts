import { inject } from 'inversify';
import {
  controller, httpGet, httpPost, httpPatch, requestParam, requestBody,
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { ReviewsService } from '../../services/business/reviews.service';
import { sendSuccess, sendError } from '../../shared/http/response.helper';

@controller('/v1/review-templates')
export class ReviewTemplatesController {
  constructor(@inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @httpGet('/', 'AuthMiddleware')
  async list(res: Response) {
    return sendSuccess(res, await this.reviewsService.getTemplates());
  }

  @httpPost('/', 'AuthMiddleware', 'RbacMiddleware')
  async create(@requestBody() body: any, res: Response) {
    return sendSuccess(res, await this.reviewsService.createTemplate(body), 201);
  }
}

@controller('/v1/review-cycles')
export class ReviewCyclesController {
  constructor(@inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @httpGet('/:cycleId/participants', 'AuthMiddleware')
  async getParticipants(@requestParam('cycleId') cycleId: string, res: Response) {
    return sendSuccess(res, await this.reviewsService.getParticipantsByCycle(cycleId));
  }

  @httpPost('/:cycleId/participants', 'AuthMiddleware', 'RbacMiddleware')
  async assign(@requestParam('cycleId') cycleId: string, @requestBody() body: any, res: Response) {
    try {
      const participant = await this.reviewsService.assignParticipant({ cycleId, ...body });
      return sendSuccess(res, participant, 201);
    } catch (err: any) {
      return sendError(res, 'CONFLICT', err.message, 409);
    }
  }

  @httpGet('/:cycleId/report/:employeeId', 'AuthMiddleware', 'RbacMiddleware')
  async report(
    @requestParam('cycleId') cycleId: string,
    @requestParam('employeeId') employeeId: string,
    res: Response,
  ) {
    const report = await this.reviewsService.getReport(cycleId, employeeId);
    if (!report) return sendError(res, 'NOT_FOUND', 'No submitted reviews found', 404);
    return sendSuccess(res, report);
  }
}

@controller('/v1/reviews')
export class ReviewsController {
  constructor(@inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @httpGet('/my-tasks', 'AuthMiddleware')
  async myTasks(req: Request, res: Response) {
    const reviewerId = (req as any).user?.employeeId;
    if (!reviewerId) return sendError(res, 'MISSING_PARAM', 'reviewerId required', 400);
    return sendSuccess(res, await this.reviewsService.getMyTasks(reviewerId));
  }

  @httpPost('/:participantId/save', 'AuthMiddleware')
  async saveDraft(
    @requestParam('participantId') participantId: string,
    @requestBody() body: any,
    res: Response,
  ) {
    return sendSuccess(res, await this.reviewsService.saveDraft(participantId, body));
  }

  @httpPost('/:participantId/submit', 'AuthMiddleware')
  async submit(
    @requestParam('participantId') participantId: string,
    @requestBody() body: any,
    req: Request,
    res: Response,
  ) {
    try {
      const review = await this.reviewsService.submit(participantId, body, (req as any).user?.id);
      return sendSuccess(res, review);
    } catch (err: any) {
      return sendError(res, 'VALIDATION_ERROR', err.message, 422);
    }
  }

  @httpPost('/:reviewId/lock', 'AuthMiddleware', 'RbacMiddleware')
  async lock(
    @requestParam('reviewId') reviewId: string,
    req: Request,
    res: Response,
  ) {
    try {
      const review = await this.reviewsService.lock(reviewId, (req as any).user?.id);
      return sendSuccess(res, review);
    } catch (err: any) {
      return sendError(res, 'VALIDATION_ERROR', err.message, 422);
    }
  }

  @httpPost('/:reviewId/acknowledge', 'AuthMiddleware')
  async acknowledge(@requestParam('reviewId') reviewId: string, res: Response) {
    try {
      const review = await this.reviewsService.acknowledge(reviewId);
      return sendSuccess(res, review);
    } catch (err: any) {
      return sendError(res, 'VALIDATION_ERROR', err.message, 422);
    }
  }
}
