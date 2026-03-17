import { createStore } from '../base/base.store';
import { dashboardService } from '@/services/resources/dashboard.service';
import { DashboardData, KPI } from '@/components/features/dashboard/hooks/useDashboardHome';

interface DashboardState {
    data: DashboardData | null;
    kpis: KPI[];
    trends: any[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    filters: {
        dateRange: string;
        departmentId?: string;
        viewType: 'summary' | 'detailed';
    };
}

const initialDashboard: DashboardState = {
    data: null,
    kpis: [],
    trends: [],
    loading: false,
    error: null,
    lastUpdated: null,
    filters: {
        dateRange: 'month',
        viewType: 'summary',
    },
};

interface DashboardActions {
    fetchDashboardData: (params?: any) => Promise<void>;
    updateFilters: (filters: Partial<DashboardState['filters']>) => void;
    refreshData: () => Promise<void>;
}

export const useDashboardStore = createStore<DashboardState, DashboardActions>(
    {
        name: 'dashboard',
        initial: initialDashboard,
        persist: false,
    },
    (set, get) => ({
        fetchDashboardData: async (params?: any) => {
            set({ loading: true, error: null });

            try {
                const currentFilters = get().filters;
                const data = await dashboardService.getDashboardData({
                    ...currentFilters,
                    ...params,
                });

                set({
                    data,
                    kpis: data.kpis || [],
                    trends: data.trends || [],
                    loading: false,
                    lastUpdated: new Date(),
                });
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to fetch dashboard data',
                    loading: false,
                });
            }
        },

        updateFilters: (filters: Partial<DashboardState['filters']>) => {
            const currentFilters = get().filters;
            const newFilters = { ...currentFilters, ...filters };
            set({ filters: newFilters });

            // Auto-refresh when filters change
            if (JSON.stringify(currentFilters) !== JSON.stringify(newFilters)) {
                get().fetchDashboardData();
            }
        },

        refreshData: async () => {
            await dashboardService.refreshDashboard();
            await get().fetchDashboardData();
        },
    })
);
