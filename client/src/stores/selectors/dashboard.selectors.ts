import { useDashboardStore } from '../business/dashboard.store';

export const useDashboardKPIs = () => {
    return useDashboardStore((state) => state.kpis);
};

export const useDashboardTrends = () => {
    return useDashboardStore((state) => state.trends);
};

export const useDashboardLoading = () => {
    return useDashboardStore((state) => state.loading);
};

export const useFilteredKPIs = (isPositive?: boolean) => {
    return useDashboardStore((state) => {
        if (isPositive === undefined) return state.kpis;
        return state.kpis.filter(kpi => kpi.isPositive === isPositive);
    });
};
