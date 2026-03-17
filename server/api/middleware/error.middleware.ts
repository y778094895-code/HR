import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { ApiResponse } from '../../shared/api-response';

@injectable()
export class ErrorMiddleware {
    public static handler(err: any, req: Request, res: Response, next: NextFunction) {
        const correlationId = (req as any).correlationId;
        const status = normalizeStatus(err?.status || err?.statusCode);
        const code = normalizeCode(err?.code, status);
        const message = normalizeMessage(err, status);
        const details = err?.details ?? err?.errors;

        if (status >= 500) {
            console.error(`[${correlationId || 'no-correlation-id'}]`, err?.stack || err);
        }

        return res.status(status).json(
            ApiResponse.error(code, message, details, { correlationId })
        );
    }
}

function normalizeStatus(status: any): number {
    const n = Number(status);
    if (!Number.isFinite(n) || n < 400 || n > 599) return 500;
    return n;
}

function normalizeCode(code: any, status: number): string {
    if (typeof code === 'string' && code.trim().length > 0) return code.trim();
    if (status === 400) return 'BAD_REQUEST';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 422) return 'VALIDATION_ERROR';
    return 'INTERNAL_SERVER_ERROR';
}

function normalizeMessage(err: any, status: number): string {
    if (typeof err?.message === 'string' && err.message.trim().length > 0) {
        return err.message;
    }
    if (status >= 500) return 'Internal Server Error';
    if (status === 404) return 'Resource not found';
    if (status === 401) return 'Unauthorized';
    if (status === 403) return 'Forbidden';
    return 'Request failed';
}
