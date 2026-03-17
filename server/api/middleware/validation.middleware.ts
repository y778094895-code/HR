import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

@injectable()
export class ValidationMiddleware extends BaseMiddleware {
    public handler(req: Request, res: Response, next: NextFunction) {
        // Implementation would depend on specific schema validation library
        next();
    }
}
