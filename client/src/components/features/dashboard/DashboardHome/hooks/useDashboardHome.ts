import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardData, KPI, Trend } from '@/services/resources/dashboard.service';
import { useToast } from '@/hooks/use-toast';

export const useDashboardHome = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [trends, setTrends] = useState<Trend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState('month');
    const { toast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Assuming getDashboardData returns the aggregate structure or we fetch separately
            // The service we implemented earlier might have slightly different signature, adapting here.
            const dashboardData = await dashboardService.getDashboardData({ dateRange: selectedDateRange });

            setData(dashboardData);
            setKpis(dashboardData.kpis || []);
            setTrends(dashboardData.trends || []);
        } catch (err: any) {
            const message = err.message || 'Failed to fetch dashboard data';
            setError(message);
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [selectedDateRange, toast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const refreshData = () => fetchDashboardData();

    return {
        data,
        kpis,
        trends,
        loading,
        error,
        refreshData,
        selectedDateRange,
        setSelectedDateRange
    };
};

export default useDashboardHome;
