// ============================================================
// Dashboard Service (PR-02)
//
// Transport normalization via normalizeKeys at every response.
// Cache stores already-normalized data.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { cacheManager } from '../cache/cache-manager';
import { KPI, DashboardData, Trend } from './types';
export type { KPI, DashboardData, Trend };


class DashboardService {
    private readonly CACHE_KEY = 'dashboard';
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    async getDashboardData(params?: {
        dateRange?: string;
        departmentId?: string;
    }): Promise<DashboardData> {
        const cacheKey = `${this.CACHE_KEY}:${JSON.stringify(params || {})}`;

        // Check cache first
        const cached = cacheManager.get<DashboardData>(cacheKey);
        if (cached) return cached;

        // Fetch from API
        const raw = await apiClient.get<unknown>('/dashboard', { params });
        const data = normalizeKeys<DashboardData>(raw);

        // Cache the normalized result
        cacheManager.set(cacheKey, data, this.CACHE_TTL);

        return data;
    }

    async getKPIs(params?: any): Promise<KPI[]> {
        const raw = await apiClient.get<unknown[]>('/dashboard/kpis', { params });
        return normalizeKeys<KPI[]>(raw);
    }

    async getTrends(params?: any): Promise<any[]> {
        const raw = await apiClient.get<unknown[]>('/dashboard/trends', { params });
        return normalizeKeys<any[]>(raw);
    }

    async refreshDashboard(): Promise<void> {
        // Clear cache for dashboard
        cacheManager.clearByPattern(`${this.CACHE_KEY}:*`);
    }
}

export const dashboardService = new DashboardService();
