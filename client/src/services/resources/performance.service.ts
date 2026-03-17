// ============================================================
// Performance Service (PR-02)
//
// All local interfaces now use camelCase, aligned to PR-01 naming.
// Transport normalization via normalizeKeys at every response.
//
// Transport assumption: backend endpoints return snake_case keys
// (e.g. overall_score, department_id, suggested_action).
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import type { PaginatedResponse, ApiParams } from '../api/types';
import type { Employee, TrainingModule } from './types';

// ---- Frontend-safe interfaces (camelCase, PR-01 aligned) ----

export interface PerformanceOverview {
    overallScore: number;
    kpis: { id: string; title: string; value: number | string; trend: number }[];
    trends: { month: string; score: number }[];
}

export interface DepartmentPerformanceSummary {
    departmentId: string;
    departmentName: string;
    averageScore: number;
    employeeCount: number;
    topPerformer?: Employee;
}

export interface PerformanceRecommendation {
    id: string;
    employeeId: string;
    type: 'training' | 'promotion' | 'intervention';
    title: string;
    description: string;
    suggestedAction?: string;
    impactScore?: number;
}

export interface EmployeePerformanceDetail {
    employee: Employee;
    score: number;
    history: { date: string; score: number }[];
    strengths: string[];
    weaknesses: string[];
    recommendedTraining: TrainingModule[];
}

// ---- Service ----

class PerformanceService {
    /**
     * Get high-level performance metrics for the dashboard.
     */
    async getPerformanceOverview(params?: ApiParams): Promise<PerformanceOverview> {
        const raw = await apiClient.get<unknown>('/performance/overview', { params });
        return normalizeKeys<PerformanceOverview>(raw);
    }

    /**
     * Get paginated list of employee performance data.
     */
    async getEmployeesPerformance(
        params?: ApiParams
    ): Promise<PaginatedResponse<Employee>> {
        const raw = await apiClient.get<unknown>('/performance/employees', { params });
        return normalizeKeys<PaginatedResponse<Employee>>(raw);
    }

    /**
     * Get performance aggregated by department.
     */
    async getDepartmentsPerformance(): Promise<DepartmentPerformanceSummary[]> {
        const raw = await apiClient.get<unknown[]>('/performance/departments');
        return normalizeKeys<DepartmentPerformanceSummary[]>(raw);
    }

    /**
     * Get AI-driven performance recommendations.
     */
    async getPerformanceRecommendations(
        employeeId?: string
    ): Promise<PerformanceRecommendation[]> {
        const params = employeeId ? { employeeId } : {};
        const raw = await apiClient.get<unknown[]>('/performance/recommendations', {
            params,
        });
        return normalizeKeys<PerformanceRecommendation[]>(raw);
    }

    /**
     * Get detailed performance view for a single employee.
     */
    async getEmployeePerformanceDetail(
        employeeId: string
    ): Promise<EmployeePerformanceDetail> {
        const raw = await apiClient.get<unknown>(
            `/performance/employees/${employeeId}`
        );
        return normalizeKeys<EmployeePerformanceDetail>(raw);
    }
}

export const performanceService = new PerformanceService();
