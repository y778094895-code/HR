import React, { useState } from 'react';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { PerformanceOverview } from '@/components/features/performance/PerformanceOverview';
import { EmployeePerformanceList } from '@/components/features/performance/EmployeePerformanceList';
import { ExportButtons } from '@/components/features/exports/ExportButtons';
import { downloadBlob } from '@/lib/download';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { LineChart, BarChart, CalendarClock, Target, AlertTriangle, Link2, BellRing, Settings2 } from 'lucide-react';

export default function PerformancePage() {
    const { t } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: 'pdf' | 'excel') => {
        setIsExporting(true);
        // TODO: Integrate with reportsService for performance reports
        await new Promise(resolve => setTimeout(resolve, 800));
        console.info(`Performance export requested for ${type}. Backend integration pending.`);
        setIsExporting(false);
    };

    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'continuous';

    const getTitle = () => {
        switch (view) {
            case 'continuous': return t('nav.continuousAnalysis', 'Continuous Performance Analysis');
            case 'kpi': return t('nav.kpis', 'KPIs');
            case 'underperformance': return t('nav.earlyUnderperformance', 'Early Underperformance');
            default: return t('performance.title', 'Performance Intelligence');
        }
    };

    const renderTabs = (): TabItem[] => {
        switch (view) {
            case 'continuous':
                return [
                    {
                        value: 'individual',
                        label: t('performance.tabs.individual', 'Individual'),
                        content: <PerformanceOverview />
                    },
                    {
                        value: 'teams',
                        label: t('performance.tabs.teams', 'Teams/Departments'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={BarChart} title={t('common.comingSoon', 'Coming Soon')} description="Team-level aggregations are under construction." />
                            </div>
                        )
                    },
                    {
                        value: 'time-comparison',
                        label: t('performance.tabs.timeComparison', 'Time Comparison'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={CalendarClock} title={t('common.comingSoon', 'Coming Soon')} description="Historical YoY performance comparison module will arrive shortly." />
                            </div>
                        )
                    }
                ];
            case 'kpi':
                return [
                    {
                        value: 'definitions',
                        label: t('performance.tabs.kpiDefinitions', 'KPI Definitions'),
                        content: <EmployeePerformanceList />
                    },
                    {
                        value: 'thresholds',
                        label: t('performance.tabs.thresholds', 'Thresholds'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Target} title={t('common.comingSoon', 'Coming Soon')} description="Global threshold configuration limits will be active soon." />
                            </div>
                        )
                    },
                    {
                        value: 'mapping',
                        label: t('performance.tabs.kpiMapping', 'KPI-to-Alerts Mapping'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Settings2} title={t('common.comingSoon', 'Coming Soon')} description="Correlation graph mappings are disabled temporarily." />
                            </div>
                        )
                    }
                ];
            case 'underperformance':
                return [
                    {
                        value: 'signals',
                        label: t('performance.tabs.signals', 'Underperformance Signals'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={BellRing} title={t('common.comingSoon', 'Coming Soon')} description="Anomaly detection service is syncing data." />
                            </div>
                        )
                    },
                    {
                        value: 'candidates',
                        label: t('performance.tabs.candidates', 'Candidates to Open Case'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={AlertTriangle} title={t('common.comingSoon', 'Coming Soon')} description="Predictive candidate flagging is queued." />
                            </div>
                        )
                    },
                    {
                        value: 'linked-cases',
                        label: t('performance.tabs.linkedCases', 'Linked Cases'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Link2} title={t('common.comingSoon', 'Coming Soon')} description="Linked PIP cases are currently loading." />
                            </div>
                        )
                    }
                ];
            default:
                return [];
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={getTitle()}
                description={t('performance.description', 'Monitor and analyze employee performance trends.')}
                actions={<ExportButtons onExport={handleExport} isLoading={isExporting} />}
            />

            <TabsContainer
                tabs={renderTabs()}
                syncWithUrl="tab"
            />
        </div>
    );
}
