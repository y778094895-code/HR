import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../stores/business/auth.store';
import { API_CONFIG } from '../../config/api';

// ============================================================
// Structured API error shape thrown by the client.
// Consumers can catch this instead of raw AxiosError.
// ============================================================
export interface ApiClientError {
    status: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

function toApiClientError(error: AxiosError): ApiClientError {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as Record<string, unknown> | undefined;
    return {
        status,
        code: (data?.code as string) ?? `HTTP_${status}`,
        message: (data?.message as string) ?? error.message,
        details: data,
    };
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.baseURL,
            timeout: API_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // ── Request: attach Bearer token ──
        this.client.interceptors.request.use(
            (config) => {
                const token = useAuthStore.getState().token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // ── Response: unwrap envelope + structured error handling ──
        this.client.interceptors.response.use(
            (response) => {
                // Unwrap backend envelope: {success: true, data: T}
                const body = response.data;
                if (body && typeof body === 'object' && 'success' in body && body.success === true && 'data' in body) {
                    response.data = body.data;
                }
                return response;
            },
            async (error: AxiosError) => {
                if (error.response) {
                    const { status, data } = error.response;
                    const body = data as Record<string, unknown> | undefined;

                    // If backend returned structured error envelope, use it
                    if (body && typeof body === 'object' && 'success' in body && body.success === false && body.error) {
                        const errEnvelope = body.error as Record<string, unknown>;
                        return Promise.reject({
                            status,
                            code: (errEnvelope.code as string) || `HTTP_${status}`,
                            message: (errEnvelope.message as string) || error.message,
                            details: errEnvelope.details,
                        } as ApiClientError);
                    }

                    // 401 Unauthorized — session expired / invalid token
                    if (status === 401) {
                        useAuthStore.getState().logout();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                    }

                    // 403 Forbidden
                    if (status === 403) {
                        console.error(
                            '[ApiClient] Forbidden: insufficient permissions for this resource.'
                        );
                    }

                    // 5xx Server Error
                    if (status >= 500) {
                        console.error('[ApiClient] Server error:', error.message);
                    }
                }

                // Always reject with a structured ApiClientError
                return Promise.reject(toApiClientError(error));
            }
        );
    }

    // ── HTTP verb helpers (return unwrapped data) ──

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    /**
     * Download a file from the server.
     * @param url Endpoint URL
     * @param _fileName Optional filename for validity check or logging
     * @param config Optional Axios config
     */
    async download(url: string, _fileName?: string, config?: AxiosRequestConfig): Promise<Blob> {
        const response = await this.client.get(url, {
            ...config,
            responseType: 'blob',
        });
        return response.data;
    }
}

export const apiClient = new ApiClient();
