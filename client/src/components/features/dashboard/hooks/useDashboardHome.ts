import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/stores/business/dashboard.store';

// Export types from her or import from types file if moved
export interface KPI {
    id: string;
    title: string;
    value: string | number;
    change?: string | number;
    trend?: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
}

export interface DashboardData {
    kpis: KPI[];
    trends: any[];
}

const useDashboardHome = () => {
    const {
        data,
        kpis,
        trends,
        loading,
        error,
        filters,
        fetchDashboardData,
        refreshData,
        updateFilters
    } = useDashboardStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const setSelectedDateRange = useCallback((range: string) => {
        updateFilters({ dateRange: range });
    }, [updateFilters]);

    return {
        kpis,
        trends,
        loading,
        error,
        refreshData,
        selectedDateRange: filters.dateRange,
        setSelectedDateRange
    };
};

export default useDashboardHome;
