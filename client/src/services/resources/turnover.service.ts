// ============================================================
// Turnover Service (PR-02)
//
// All local interfaces now use camelCase, aligned to PR-01 naming.
// Transport normalization via normalizeKeys at every response.
//
// Transport assumption: backend endpoints return snake_case keys
// (e.g. risk_rate, high_risk_count, xai_explanation).
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import { PaginatedResponse, ApiParams } from '../api/types';
import { TurnoverRisk } from '../../types/risk';
import { ExplainabilityRecord } from '../../types/xai';
import { KPI } from '../../types/kpi';

// ---- Frontend-safe interfaces (camelCase, PR-01 aligned) ----

export interface TurnoverDashboardMetrics {
    riskRate: number;
    highRiskCount: number;
    predictionsCount: number;
    kpis: KPI[];
}

export interface RiskDetail extends TurnoverRisk {
    history: { date: string; score: number }[];
    xaiExplanation: ExplainabilityRecord;
}

// ---- Service ----

class TurnoverService {
    /**
     * Get high-level turnover KPIs
     */
    async getDashboardMetrics(): Promise<TurnoverDashboardMetrics> {
        const raw = await apiClient.get<unknown>('/turnover/metrics');
        return normalizeKeys<TurnoverDashboardMetrics>(raw);
    }

    /**
     * Get paginated list of employees at risk
     */
    async getRiskList(params?: ApiParams): Promise<PaginatedResponse<TurnoverRisk>> {
        const raw = await apiClient.get<unknown>('/turnover/risks', { params });
        return normalizeKeys<PaginatedResponse<TurnoverRisk>>(raw);
    }

    /**
     * Get detailed risk analysis including XAI explanation
     */
    async getRiskDetail(employeeId: string): Promise<RiskDetail> {
        const raw = await apiClient.get<unknown>(`/turnover/risks/${employeeId}`);
        return normalizeKeys<RiskDetail>(raw);
    }

    // --- Legacy / Specific Methods ---

    /**
     * Trigger a new prediction for an employee
     */
    async predictRisk(employeeId: string): Promise<TurnoverRisk> {
        const raw = await apiClient.post<unknown>(`/turnover/predict/${employeeId}`);
        return normalizeKeys<TurnoverRisk>(raw);
    }

    // Aliases for Store Compatibility
    async getTurnoverRisks(params?: ApiParams): Promise<PaginatedResponse<TurnoverRisk>> {
        return this.getRiskList(params);
    }

    async getTurnoverPrediction(employeeId: string): Promise<TurnoverRisk> {
        return this.predictRisk(employeeId);
    }
}

export const turnoverService = new TurnoverService();
