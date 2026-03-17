// ============================================================
// User Service (PR-02)
//
// Transport normalization via normalizeKeys at every response.
// Payload normalization via normalizeUsers for defensive handling.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { normalizeUsers } from '@/lib/users-normalizer';
import { User } from './types';

class UserService {
    async getUsers(): Promise<User[]> {
        const raw = await apiClient.get<unknown>('/users');
        const normalized = normalizeKeys<unknown>(raw);
        // Apply normalizeUsers to handle wrapped payloads like { success: true, data: {...} }
        return normalizeUsers(normalized);
    }

    async deleteUser(id: string): Promise<void> {
        return apiClient.delete(`/users/${id}`);
    }

    async createUser(data: Partial<User>): Promise<User> {
        const raw = await apiClient.post<unknown>('/users', data);
        return normalizeKeys<User>(raw);
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const raw = await apiClient.put<unknown>(`/users/${id}`, data);
        return normalizeKeys<User>(raw);
    }

    async updateUserStatus(id: string, isActive: boolean): Promise<User> {
        const raw = await apiClient.patch<unknown>(`/users/${id}/status`, { isActive });
        return normalizeKeys<User>(raw);
    }
}

export const userService = new UserService();
export default userService;
