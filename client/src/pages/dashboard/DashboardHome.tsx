import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardScope } from '@/hooks/useDashboardScope';
import { dashboardDataAdapter } from '@/services/adapters/dashboardDataAdapter';
import { useCaseStore } from '@/stores/business/case.store';
import type { DashboardResponse, DashboardFilters, RiskEmployee } from '@/types/dashboard.types';
import { DEFAULT_DASHBOARD_FILTERS } from '@/types/dashboard.types';
import '@/styles/dashboard.css';

// Eagerly loaded (above the fold)
import KPIStrip from '@/components/features/dashboard/KPIStrip';
import DashboardSmartFilters from '@/components/features/dashboard/DashboardSmartFilters';
import RiskIntelligencePanel from '@/components/features/dashboard/RiskIntelligencePanel';
import RiskDrawer from '@/components/features/dashboard/RiskDrawer';
import PerformanceIntelligencePanel from '@/components/features/dashboard/PerformanceIntelligencePanel';
import FairnessMonitoringPanel from '@/components/features/dashboard/FairnessMonitoringPanel';
import CreateCaseModal from '@/components/features/dashboard/CreateCaseModal';

// Lazy loaded (below the fold)
const ActiveCasesTable = lazy(() => import('@/components/features/dashboard/ActiveCasesTable'));
const ActionFeed = lazy(() => import('@/components/features/dashboard/ActionFeed'));

// ---- Section Loading Fallback ----
function SectionSkeleton({ height = 200 }: { height?: number }) {
    return <div className="dash-skeleton w-full" style={{ height }} />;
}

// ---- Widget State ----
interface WidgetState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export default function DashboardHome() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const scope = useDashboardScope();
    const cases = useCaseStore((s) => s.cases);

    // Widget states (independent per section)
    const [kpiState, setKpiState] = useState<WidgetState<DashboardResponse['kpis']>>({ data: null, loading: true, error: null });
    const [riskState, setRiskState] = useState<WidgetState<DashboardResponse['risk']>>({ data: null, loading: true, error: null });
    const [perfState, setPerfState] = useState<WidgetState<DashboardResponse['performance']>>({ data: null, loading: true, error: null });
    const [fairState, setFairState] = useState<WidgetState<DashboardResponse['fairness']>>({ data: null, loading: true, error: null });
    const [feedState, setFeedState] = useState<WidgetState<DashboardResponse['alerts']>>({ data: null, loading: true, error: null });

    // Drawer & modal state
    const [drawerEmployee, setDrawerEmployee] = useState<RiskEmployee | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createCaseOpen, setCreateCaseOpen] = useState(false);

    // ---- Fetch Dashboard Data ----
    const fetchData = useCallback(async (filters?: Partial<DashboardFilters>) => {
        // Set all visible sections to loading
        if (scope.visibleSections.kpiStrip) setKpiState(s => ({ ...s, loading: true, error: null }));
        if (scope.visibleSections.riskIntelligence) setRiskState(s => ({ ...s, loading: true, error: null }));
        if (scope.visibleSections.performanceIntelligence) setPerfState(s => ({ ...s, loading: true, error: null }));
        if (scope.visibleSections.fairnessMonitoring) setFairState(s => ({ ...s, loading: true, error: null }));
        if (scope.visibleSections.actionFeed) setFeedState(s => ({ ...s, loading: true, error: null }));

        try {
            const response = await dashboardDataAdapter.getDashboardData(filters);

            // Update all sections at once for a stable render
            if (scope.visibleSections.kpiStrip) setKpiState({ data: response.kpis, loading: false, error: null });
            if (scope.visibleSections.riskIntelligence) setRiskState({ data: response.risk, loading: false, error: null });
            if (scope.visibleSections.performanceIntelligence) setPerfState({ data: response.performance, loading: false, error: null });
            if (scope.visibleSections.fairnessMonitoring) setFairState({ data: response.fairness, loading: false, error: null });
            if (scope.visibleSections.actionFeed) setFeedState({ data: response.alerts, loading: false, error: null });

        } catch (err: any) {
            const errorMsg = err?.message || 'فشل تحميل البيانات';
            setKpiState(s => ({ ...s, loading: false, error: errorMsg }));
            setRiskState(s => ({ ...s, loading: false, error: errorMsg }));
            setPerfState(s => ({ ...s, loading: false, error: errorMsg }));
            setFairState(s => ({ ...s, loading: false, error: errorMsg }));
            setFeedState(s => ({ ...s, loading: false, error: errorMsg }));
        }
    }, [scope.visibleSections]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ---- Filter change handler ----
    const handleFilterChange = useCallback((filters: DashboardFilters) => {
        dashboardDataAdapter.clearCache();
        fetchData(filters);
    }, [fetchData]);

    // ---- Risk Drawer handlers ----
    const handleOpenDrawer = useCallback((employee: RiskEmployee) => {
        setDrawerEmployee(employee);
        setDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        setTimeout(() => setDrawerEmployee(null), 300);
    }, []);

    // Expose create case modal to parent (DashboardLayout) via window event
    useEffect(() => {
        const handler = () => setCreateCaseOpen(true);
        window.addEventListener('dashboard:create-case', handler);
        return () => window.removeEventListener('dashboard:create-case', handler);
    }, []);

    // ---- No analytics view for super_admin ----
    if (!scope.canSeeAnalytics && !scope.visibleSections.activeCases && !scope.visibleSections.actionFeed) {
        return (
            <div className="dashboard-hub space-y-6">
                <div className="rounded-2xl border bg-card p-12 text-center">
                    <p className="text-lg font-semibold text-muted-foreground">مرحباً {user?.fullName || 'المسؤول'}</p>
                    <p className="text-sm text-muted-foreground mt-2">هذا الحساب مخصص لإدارة النظام ولا يتضمن لوحات التحليلات.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-hub space-y-6">
            {/* Sticky Smart Filters */}
            <DashboardSmartFilters onFilterChange={handleFilterChange} />

            {/* Section 1: KPI Strip (loads first) */}
            {scope.visibleSections.kpiStrip && (
                <KPIStrip kpis={kpiState.data || []} loading={kpiState.loading} error={kpiState.error} />
            )}

            {/* Section 2: Risk Intelligence */}
            {scope.visibleSections.riskIntelligence && (
                <RiskIntelligencePanel
                    data={riskState.data}
                    loading={riskState.loading}
                    error={riskState.error}
                    onOpenDrawer={handleOpenDrawer}
                />
            )}

            {/* Section 3: Performance Intelligence */}
            {scope.visibleSections.performanceIntelligence && (
                <PerformanceIntelligencePanel
                    data={perfState.data}
                    loading={perfState.loading}
                    error={perfState.error}
                />
            )}

            {/* Section 4: Fairness Monitoring */}
            {scope.visibleSections.fairnessMonitoring && (
                <FairnessMonitoringPanel
                    data={fairState.data}
                    loading={fairState.loading}
                    error={fairState.error}
                />
            )}

            {/* Section 5: Active Cases (Lazy) */}
            {scope.visibleSections.activeCases && (
                <Suspense fallback={<SectionSkeleton height={250} />}>
                    <ActiveCasesTable cases={cases} loading={false} error={null} />
                </Suspense>
            )}

            {/* Section 6: Action Feed (Lazy) */}
            {scope.visibleSections.actionFeed && (
                <Suspense fallback={<SectionSkeleton height={200} />}>
                    <ActionFeed items={feedState.data || []} loading={feedState.loading} error={feedState.error} />
                </Suspense>
            )}

            {/* Risk Drawer */}
            <RiskDrawer employee={drawerEmployee} open={drawerOpen} onClose={handleCloseDrawer} />

            {/* Create Case Modal */}
            <CreateCaseModal open={createCaseOpen} onClose={() => setCreateCaseOpen(false)} />
        </div>
    );
}
