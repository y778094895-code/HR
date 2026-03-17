import { Request, Response, NextFunction } from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';
import { getCorrelationId } from '../../shared/http/contracts';

@injectable()
export class CorrelationIdMiddleware extends BaseMiddleware {
    public handler(req: Request, res: Response, next: NextFunction) {
        const correlationId = getCorrelationId(req);
        (req as any).correlationId = correlationId;
        res.setHeader('x-correlation-id', correlationId);
        next();
    }
}
