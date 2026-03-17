import { DashboardData, KPI, Trend } from './../resources/types';

export const dashboardTransformer = {
    toFrontend: (apiData: any): DashboardData => {
        const data = apiData.data || apiData;
        return {
            kpis: (data.kpis || []).map((k: any) => ({
                id: k.id,
                title: k.name || k.title,
                value: k.value,
                trend: k.trend,
                isPositive: k.is_positive,
                change: k.change_percentage
            })),
            trends: (data.trends || []).map((t: any) => ({
                name: t.date || t.name,
                value: t.value || t.count,
                change: t.change
            })),
            lastUpdated: new Date().toISOString()
        };
    }
};
