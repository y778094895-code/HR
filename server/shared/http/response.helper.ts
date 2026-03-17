import { Response } from 'express';
import { ApiResponse } from '../api-response';

/**
 * Send a successful JSON response.
 * Shape: { success: true, data, message, timestamp }
 */
export function sendSuccess(res: Response, data: any, statusCode = 200): void {
    res.status(statusCode).json(ApiResponse.success(data));
}

/**
 * Send an error JSON response.
 * Shape: { success: false, error: { code, message, details? }, timestamp }
 */
export function sendError(
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: any,
): void {
    res.status(statusCode).json(ApiResponse.error(code, message, details));
}

/**
 * Send a paginated JSON response.
 * Shape: { success: true, data, pagination: { page, pageSize, total, totalPages }, timestamp }
 */
export function sendPaginated(
    res: Response,
    data: any,
    total: number,
    page: number,
    pageSize: number,
): void {
    res.status(200).json(
        ApiResponse.success(data, 'Success', {
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        }),
    );
}
