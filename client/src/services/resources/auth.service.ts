import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { LoginRequest, LoginResponse, RegisterRequest, UserProfile } from '@/types/auth';

class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        // Post credentials to login endpoint
        const response: any = await apiClient.post('/auth/login', credentials);

        // Normalize response
        // Backend might return token in different fields (access_token, token, etc.)
        // This normalization logic mirrors what was in AuthContext
        const token = response.access_token || response.accessToken || response.token || response.jwt ||
            (response.data && (response.data.access_token || response.data.token));

        const user = response.user || response.profile || (response.data && response.data.user);

        // Validation similar to AuthContext
        if (!token || !user) {
            throw new Error('Invalid response from server: missing user or token');
        }

        return {
            user: user as UserProfile,
            access_token: token
        };
    }

    async register(data: RegisterRequest): Promise<LoginResponse> {
        const response: any = await apiClient.post('/auth/register', data);

        // Normalize response (assuming register also returns token/user)
        const token = response.access_token || response.token;
        const user = response.user || response.data?.user;

        if (!token || !user) {
            // Fallback if register doesn't auto-login, might just return success
            return response;
        }

        return {
            user: user as UserProfile,
            access_token: token
        };
    }

    async logout(): Promise<void> {
        return apiClient.post('/auth/logout');
    }

    async getCurrentUser(): Promise<UserProfile> {
        const raw = await apiClient.get<unknown>('/auth/me');
        return normalizeKeys<UserProfile>(raw);
    }

    async refreshToken(): Promise<{ token: string }> {
        return apiClient.post<{ token: string }>('/auth/refresh-token');
    }
}

export const authService = new AuthService();
