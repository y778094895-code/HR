export interface KPI {
    id: string;
    title: string;
    value: number | string;
    trend: number;
    priority?: 'high' | 'medium' | 'low';
    icon?: string;
    change?: string;
    isPositive?: boolean;
}

export interface Trend {
    id?: string;
    name: string;
    value: number;
    data?: number[];
    change: number;
}

export interface DashboardData {
    kpis: KPI[];
    trends: Trend[];
    summary?: string;
    lastUpdated?: string;
}
