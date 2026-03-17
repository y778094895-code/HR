export class ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
    errors: any | null;
    timestamp: string;

    constructor(success: boolean, data: T | null = null, message: string | null = null, errors: any | null = null) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }

    static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
        return new ApiResponse(true, data, message);
    }

    static error(message: string, errors: any = null): ApiResponse<null> {
        return new ApiResponse(false, null, message, errors);
    }
}
