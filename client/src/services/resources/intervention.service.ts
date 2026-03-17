// ============================================================
// Intervention Service (PR-02)
//
// Transport normalization via normalizeKeys at every response.
// POST/PATCH commands returning void are unchanged.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { ApiParams, PaginatedResponse } from '../api/types';
import { Intervention } from './types';
export type { Intervention };

import { Recommendation } from './types';
import { ImpactStats } from './types';

class InterventionService {
    /**
     * Get interventions with optional filtering (status, type)
     */
    async getInterventions(params?: ApiParams & { status?: 'Draft' | 'Active' | 'Completed' | 'Closed' }): Promise<PaginatedResponse<Intervention>> {
        const raw = await apiClient.get<unknown>('/interventions', { params });
        return normalizeKeys<PaginatedResponse<Intervention>>(raw);
    }

    async getInterventionDetail(id: string): Promise<Intervention> {
        const raw = await apiClient.get<unknown>(`/interventions/${id}`);
        return normalizeKeys<Intervention>(raw);
    }

    async createIntervention(data: Partial<Intervention>): Promise<Intervention> {
        const raw = await apiClient.post<unknown>('/interventions', data);
        return normalizeKeys<Intervention>(raw);
    }

    async updateStatus(id: string, status: string): Promise<void> {
        return apiClient.patch(`/interventions/${id}/status`, { status });
    }

    async logAction(id: string, action: string, notes?: string): Promise<void> {
        return apiClient.post(`/interventions/${id}/log`, { action, notes });
    }

    async getRecommendations(): Promise<Recommendation[]> {
        const raw = await apiClient.get<unknown[]>('/recommendations');
        return normalizeKeys<Recommendation[]>(raw);
    }

    async handleRecommendationAction(id: string, action: 'accept' | 'reject' | 'apply'): Promise<void> {
        return apiClient.post(`/recommendations/${id}/${action}`);
    }

    async getAnalytics(): Promise<ImpactStats> {
        const raw = await apiClient.get<unknown>('/interventions/analytics');
        return normalizeKeys<ImpactStats>(raw);
    }
}

export const interventionService = new InterventionService();
