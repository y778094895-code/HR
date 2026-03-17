// ============================================================
// Dashboard Data Adapter (PR-02)
//
// Single responsibility: fetch dashboard data from the backend,
// normalize transport keys, and return a DashboardResponse shape.
//
// Transport assumption: GET /dashboard/stats may return snake_case
// keys. normalizeKeys handles this defensively.
// ============================================================

import type {
    DashboardResponse,
    DashboardFilters,
    RiskData,
    PerformanceData,
    FairnessData,
} from '@/types/dashboard.types';
import { apiClient } from '@/services/api/client';
import { normalizeKeys } from '@/services/api/normalizers';
import { useCaseStore } from '@/stores/business/case.store';

/** Default empty shapes to avoid undefined spreading */
const EMPTY_RISK: RiskData = {
    heatmap: [],
    distribution: { high: 0, medium: 0, low: 0 },
    trend: [],
    topEmployees: [],
};

const EMPTY_PERFORMANCE: PerformanceData = {
    trend: [],
    departments: [],
    earlyDeclineDetected: false,
};

const EMPTY_FAIRNESS: FairnessData = {
    salaryGap: { value: 0, status: 'fair' },
    evaluationBias: { value: 0, status: 'fair' },
    promotionEquity: { value: 0, status: 'fair' },
    overallAlert: false,
};

class DashboardDataAdapter {
    private cache: { data: DashboardResponse | null; timestamp: number } = {
        data: null,
        timestamp: 0,
    };
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Fetch, normalize, and assemble the full dashboard payload.
     *
     * @param _filters  Dashboard filter parameters (forwarded when backend supports them)
     */
    async getDashboardData(_filters?: Partial<DashboardFilters>): Promise<DashboardResponse> {
        // Return cached data if still fresh
        if (this.cache.data && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
            return this.cache.data;
        }

        // Fetch from the real backend API
        const raw = await apiClient.get<Record<string, unknown>>('/dashboard/stats');

        // Normalize transport keys (snake_case → camelCase)
        const data = normalizeKeys<Record<string, any>>(raw);

        // Pull live cases from the persisted store (store not modified in PR-02)
        const cases = useCaseStore.getState().cases;

        const response: DashboardResponse = {
            kpis: data.kpis ?? [],
            risk: data.risk ? { ...EMPTY_RISK, ...data.risk } : EMPTY_RISK,
            performance: data.performance
                ? { ...EMPTY_PERFORMANCE, ...data.performance }
                : EMPTY_PERFORMANCE,
            fairness: data.fairness
                ? { ...EMPTY_FAIRNESS, ...data.fairness }
                : EMPTY_FAIRNESS,
            cases,
            alerts: data.alerts ?? [],
            trends: data.trends ?? [],
        };

        // Cache assembled response
        this.cache = { data: response, timestamp: Date.now() };
        return response;
    }

    /** Force-refresh by clearing cache then fetching. */
    async refresh(filters?: Partial<DashboardFilters>): Promise<DashboardResponse> {
        this.clearCache();
        return this.getDashboardData(filters);
    }

    /** Invalidate the in-memory cache. */
    clearCache(): void {
        this.cache = { data: null, timestamp: 0 };
    }
}

export const dashboardDataAdapter = new DashboardDataAdapter();
