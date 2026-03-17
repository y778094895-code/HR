export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface ApiErrorShape {
    code: string;
    message: string;
    details?: any;
}

export interface ApiResponseShape<T> {
    success: boolean;
    message: string;
    data: T | null;
    error: ApiErrorShape | null;
    pagination?: PaginationMeta;
    correlationId?: string;
    timestamp: string;
}

export class ApiResponse<T> {
    static success<T>(
        data: T,
        message: string = 'Success',
        options?: { pagination?: PaginationMeta; correlationId?: string }
    ): ApiResponseShape<T> {
        return {
            success: true,
            message,
            data,
            error: null,
            timestamp: new Date().toISOString(),
            ...(options?.pagination && { pagination: options.pagination }),
            ...(options?.correlationId && { correlationId: options.correlationId }),
        };
    }

    static error(
        code: string,
        message: string = 'Validation Error',
        details?: any,
        options?: { correlationId?: string }
    ): ApiResponseShape<null> {
        return {
            success: false,
            message,
            data: null,
            error: {
                code,
                message,
                ...(details !== undefined ? { details } : {}),
            },
            timestamp: new Date().toISOString(),
            ...(options?.correlationId && { correlationId: options.correlationId }),
        };
    }
}
