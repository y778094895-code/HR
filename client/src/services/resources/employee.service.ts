// ============================================================
// Employee Service (PR-02)
//
// Transport normalization via normalizeKeys at every response.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { PaginatedResponse, ApiParams } from '../api/types';
import { Employee } from '../../types/users';
export type { Employee };


class EmployeeService {
    async getEmployees(params?: ApiParams): Promise<PaginatedResponse<Employee>> {
        const raw = await apiClient.get<unknown>('/employees', { params });
        return normalizeKeys<PaginatedResponse<Employee>>(raw);
    }

    async getEmployeeById(id: string): Promise<Employee> {
        const raw = await apiClient.get<unknown>(`/employees/${id}`);
        return normalizeKeys<Employee>(raw);
    }

    async createEmployee(data: Partial<Employee>): Promise<Employee> {
        const raw = await apiClient.post<unknown>('/employees', data);
        return normalizeKeys<Employee>(raw);
    }

    async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
        const raw = await apiClient.put<unknown>(`/employees/${id}`, data);
        return normalizeKeys<Employee>(raw);
    }

    async deleteEmployee(id: string): Promise<void> {
        return apiClient.delete(`/employees/${id}`);
    }

    async getEmployeePerformance(id: string): Promise<any> {
        const raw = await apiClient.get<unknown>(`/employees/${id}/performance`);
        return normalizeKeys<any>(raw);
    }
}

export const employeeService = new EmployeeService();
export default employeeService;
