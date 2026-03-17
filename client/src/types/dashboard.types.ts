// ============================================================
// Dashboard Intelligence Hub — Unified Types (PR-01)
// ============================================================

// ---- Enums & Literals ----
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high';
export type FeedItemType = 'alert' | 'threshold' | 'recommendation' | 'performance_drop';
export type FeedAction = 'view' | 'open_case' | 'dismiss';

// ---- KPI ----

/** A single KPI card on the dashboard */
export interface DashboardKPI {
    id: string;
    label: string;
    value: number;
    changePercent: number;
    changeDirection: 'up' | 'down' | 'neutral';
    /** Period label, e.g. "MoM" or "QoQ" */
    changePeriod: string;
    /** Data points for the mini sparkline (6 values) */
    sparklineData: number[];
    /** Deep-link path, e.g. "/dashboard/performance" */
    deepLink: string;
    /** Tooltip explaining this KPI */
    tooltip: string;
}

// ---- Risk ----

/** XAI driver factor used in dashboard risk panels */
export interface XAIDriver {
    factor: string;
    impact: number;
    description: string;
}

/** Employee-level risk record for dashboard display */
export interface RiskEmployee {
    /** Database ID of the risk record or employee */
    id: string;
    /** Actual employee ID matching DB */
    employeeId?: string;
    name: string;
    department: string;
    /** Risk probability score, range 0–1 */
    riskScore: number;
    /** Categorical risk level */
    riskLevel?: RiskLevel;
    primaryDriver: string;
    /** Structured contributing factors */
    contributingFactors?: XAIDriver[];
    suggestedIntervention: string;
    timeline: RiskTimelineEvent[];
    /** ML model version that produced this prediction */
    mlModelVersion?: string;
}

/** A single event in the risk timeline */
export interface RiskTimelineEvent {
    date: string;
    description: string;
    source: string;
}

/** Departmental risk cell for the heatmap */
export interface DepartmentRiskCell {
    department: string;
    level: RiskLevel;
    score: number;
}

/** Risk distribution across severity levels */
export interface RiskDistribution {
    high: number;
    medium: number;
    low: number;
}

/** Single data point in the risk trend chart */
export interface RiskTrendPoint {
    month: string;
    score: number;
}

/** Aggregated risk data for the dashboard */
export interface RiskData {
    heatmap: DepartmentRiskCell[];
    distribution: RiskDistribution;
    trend: RiskTrendPoint[];
    topEmployees: RiskEmployee[];
}

// ---- Performance ----

/** Single data point in the performance trend chart */
export interface PerformanceTrendPoint {
    month: string;
    score: number;
}

/** Performance summary for a single department */
export interface DepartmentPerformance {
    department: string;
    score: number;
    change: number;
}

/** Aggregated performance data for the dashboard */
export interface PerformanceData {
    trend: PerformanceTrendPoint[];
    departments: DepartmentPerformance[];
    earlyDeclineDetected: boolean;
    declineDescription?: string;
}

// ---- Fairness ----

/** Dashboard-level fairness summary */
export interface FairnessData {
    salaryGap: { value: number; status: string };
    evaluationBias: { value: number; status: string };
    promotionEquity: { value: number; status: string };
    overallAlert: boolean;
}

// ---- Action Feed ----

/** A single item in the dashboard action feed */
export interface ActionFeedItem {
    id: string;
    type: FeedItemType;
    /** Emoji icon */
    icon: string;
    message: string;
    detail?: string;
    /** ISO timestamp */
    timestamp: string;
    employeeId?: string;
    employeeName?: string;
    availableActions: FeedAction[];
}

// ---- Dashboard Filters ----

/** Filter parameters for dashboard queries */
export interface DashboardFilters {
    timePeriod: string;
    customDateStart?: string;
    customDateEnd?: string;
    department: string;
    location: string;
    contractType: string;
    jobGrade: string;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
    timePeriod: 'quarter',
    department: '',
    location: '',
    contractType: '',
    jobGrade: '',
};

// ---- Aggregated Response ----

/** Full dashboard API response shape */
export interface DashboardResponse {
    kpis: DashboardKPI[];
    risk: RiskData;
    performance: PerformanceData;
    fairness: FairnessData;
    cases: any[];
    alerts: ActionFeedItem[];
    trends?: any[];
}
