import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/stores/business/dashboard.store';
import { useToast } from '@/hooks/use-toast';

export const useDashboard = () => {
    const {
        data,
        kpis,
        trends,
        loading,
        error,
        filters,
        fetchDashboardData,
        updateFilters,
        refreshData
    } = useDashboardStore();

    const { toast } = useToast();

    const loadData = useCallback(async () => {
        try {
            await fetchDashboardData();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to load dashboard data",
                variant: "destructive",
            });
        }
    }, [fetchDashboardData, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        data,
        kpis,
        trends,
        loading,
        error,
        filters,
        updateFilters,
        refreshData: loadData,
    };
};

export default useDashboard;
