// ============================================================
// Fairness Service (PR-02)
//
// Transport normalization via normalizeKeys at every response.
// Types already camelCase (PR-01), normalizeKeys is a safe no-op
// when backend returns camelCase.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { ApiParams } from '../api/types';
import { BiasMetric, DemographicComparison, FairnessRecommendation } from './types';


class FairnessService {
    /**
     * Get overall fairness metrics (bias scores across categories)
     */
    async getFairnessMetrics(params?: ApiParams): Promise<BiasMetric[]> {
        const raw = await apiClient.get<unknown[]>('/fairness/metrics', { params });
        return normalizeKeys<BiasMetric[]>(raw);
    }

    /**
     * Compare performance/stats across demographic groups (e.g., 'gender', 'department')
     */
    async getDemographicComparison(groupBy: string): Promise<DemographicComparison> {
        const raw = await apiClient.get<unknown>('/fairness/comparison', { params: { groupBy } });
        return normalizeKeys<DemographicComparison>(raw);
    }

    /**
     * Get AI-driven recommendations to improve fairness
     */
    async getFairnessRecommendations(): Promise<FairnessRecommendation[]> {
        const raw = await apiClient.get<unknown[]>('/fairness/recommendations');
        return normalizeKeys<FairnessRecommendation[]>(raw);
    }

    /**
     * Analyze fairness for a specific department
     */
    async analyzeDepartment(departmentId: string): Promise<BiasMetric[]> {
        const raw = await apiClient.post<unknown[]>('/fairness/analyze', { departmentId });
        return normalizeKeys<BiasMetric[]>(raw);
    }

    // --- Legacy / Visualization Data methods ---

    async getEqualityMatrix(): Promise<any> {
        const raw = await apiClient.get<unknown>('/fairness/matrix');
        return normalizeKeys<any>(raw);
    }

    async getGapAnalysis(): Promise<any> {
        const raw = await apiClient.get<unknown>('/fairness/gap-analysis');
        return normalizeKeys<any>(raw);
    }

    // Aliases for Store Compatibility
    async getBiasMetrics(params?: ApiParams): Promise<BiasMetric[]> {
        return this.getFairnessMetrics(params);
    }

    async getFairnessAnalysis(): Promise<any> {
        return this.getFairnessMetrics();
    }
}

export const fairnessService = new FairnessService();
