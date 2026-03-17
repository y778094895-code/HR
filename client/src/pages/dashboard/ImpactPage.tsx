import React, { useEffect } from 'react';
import { useImpact } from '@/hooks/useImpact';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/cards/card';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingDown, TrendingUp, Users, Target, Activity, Clock, ShieldCheck, UserCheck, GraduationCap, Percent, Scale, LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/feedback/EmptyState';

const ImpactPage: React.FC = () => {
    const { t } = useTranslation();
    const { overview, loading, fetchOverview } = useImpact();

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    // Check for valid trend data - must have meaningful data points
    const hasValidTrendData = React.useMemo(() => {
        const trends = (overview as any)?.trends;
        return Array.isArray(trends) && trends.length > 0 && trends.some((t: any) => t && typeof t.impact === 'number' && t.impact !== 0);
    }, [overview]);

    // Only use real data if available, not fallback zeros
    const chartData = React.useMemo(() => {
        const trends = (overview as any)?.trends;
        if (Array.isArray(trends) && trends.length > 0) {
            return trends.filter((t: any) => t && typeof t.date === 'string' && typeof t.impact === 'number');
        }
        return [];
    }, [overview]);

    // Check for valid outcome data
    const hasValidOutcomeData = React.useMemo(() => {
        const outcomes = (overview as any)?.outcomes;
        return Array.isArray(outcomes) && outcomes.length > 0 && outcomes.some((o: any) => o && typeof o.value === 'number' && o.value > 0);
    }, [overview]);

    // Determine if we have any meaningful intervention data
    const hasAnyData = React.useMemo(() => {
        return (overview?.totalInterventions ?? 0) > 0 || hasValidTrendData || hasValidOutcomeData;
    }, [overview, hasValidTrendData, hasValidOutcomeData]);

    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'performance';

    const getTitle = () => {
        switch (view) {
            case 'performance': return t('nav.impactOnPerformance', 'Impact On Performance');
            case 'attrition': return t('nav.impactOnAttrition', 'Impact On Attrition');
            case 'training': return t('nav.impactOfTraining', 'Impact Of Training');
            case 'comparison': return t('nav.periodComparison', 'Period Comparison');
            default: return t('impact.title', 'Impact Analytics');
        }
    };

    const impactTabContent = loading ? (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    ) : !hasAnyData ? (
        <div className="mt-4">
            <EmptyState 
                icon={Activity} 
                title={t('impact.noDataTitle', 'No Impact Data Available')}
                description={t('impact.noDataDesc', 'Impact analytics will appear once interventions are created and tracked in the system.')}
                className="py-16"
            />
        </div>
    ) : (
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('impact.totalInterventions', 'Total Interventions')}</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.totalInterventions || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('impact.activeInterventions', 'Total historically logged')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('impact.completedInterventions', 'Completed')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {overview?.completedCount || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('impact.successMetric', 'Successfully executed')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('impact.successRate', 'Success Rate')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(overview?.successRate || 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">{t('impact.overallPerformance', 'Intervention effectiveness')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('impact.riskReduction', 'Risk Reduction')}</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((overview as any)?.riskReduction || 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">{t('impact.estimatedReduction', 'Estimated aggregate impact')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>{t('impact.impactTrend', 'Impact Trend')}</CardTitle>
                        <CardDescription>{t('impact.impactTrendDesc', 'Aggregate impact score across all active interventions over time.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] min-h-[300px]">
                        {hasValidTrendData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="impact"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorImpact)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">{t('impact.noTrendData', 'Limited trend data available')}</p>
                                <p className="text-xs mt-1">Trend analytics will populate as more intervention data is collected.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{t('impact.topOutcomeDist', 'Top Outcome Distribution')}</CardTitle>
                        <CardDescription>{t('impact.topOutcomeDistDesc', 'Breakdown of intervention outcomes by category.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasValidOutcomeData ? (
                            (overview as any)?.outcomes?.map((item: any) => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-muted-foreground">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color || 'bg-indigo-500'}`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Target className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">{t('impact.noOutcomeData', 'Limited outcome data available')}</p>
                                <p className="text-xs mt-1 text-center">Outcome tracking will appear as interventions are completed.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );


    const renderTabs = (): TabItem[] => {
        switch (view) {
            case 'performance':
                return [
                    {
                        value: 'overall',
                        label: t('impact.tabs.overallImpact', 'Overall Impact'),
                        content: impactTabContent
                    },
                    {
                        value: 'productivity',
                        label: t('impact.tabs.timeToProd', 'Time-to-Productivity'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Clock} title={t('common.comingSoon', 'Coming Soon')} description="Measurements of time-to-productivity across teams." />
                            </div>
                        )
                    },
                    {
                        value: 'quality',
                        label: t('impact.tabs.qualityMetrics', 'Quality Metrics'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={ShieldCheck} title={t('common.comingSoon', 'Coming Soon')} description="Correlation of interventions with work quality scores." />
                            </div>
                        )
                    }
                ];
            case 'attrition':
                return [
                    {
                        value: 'retention',
                        label: t('impact.tabs.retentionChanges', 'Retention Rate Changes'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={TrendingUp} title={t('common.comingSoon', 'Coming Soon')} description="Tracking successful retention rate uplifts post-intervention." />
                            </div>
                        )
                    },
                    {
                        value: 'saved',
                        label: t('impact.tabs.highRiskSaved', 'High-Risk Saved'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={UserCheck} title={t('common.comingSoon', 'Coming Soon')} description="Cataloging previously high-risk employees now stable." />
                            </div>
                        )
                    }
                ];
            case 'training':
                return [
                    {
                        value: 'post-training',
                        label: t('impact.tabs.postTraining', 'Post-training Performance'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={GraduationCap} title={t('common.comingSoon', 'Coming Soon')} description="Tracking performance changes directly linked to training." />
                            </div>
                        )
                    },
                    {
                        value: 'roi',
                        label: t('impact.tabs.trainingRoi', 'ROI'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Percent} title={t('common.comingSoon', 'Coming Soon')} description="Financial return on investment for training programs." />
                            </div>
                        )
                    }
                ];
            case 'comparison':
                return [
                    {
                        value: 'before-after',
                        label: t('impact.tabs.beforeAfter', 'Before & After'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Scale} title={t('common.comingSoon', 'Coming Soon')} description="Direct measurement of metrics before and after action." />
                            </div>
                        )
                    },
                    {
                        value: 'dept-vs-dept',
                        label: t('impact.tabs.deptVsDept', 'Department vs Department'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={LineChart} title={t('common.comingSoon', 'Coming Soon')} description="Comparative analytics of intervention success across departments." />
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
                description={t('impact.description', 'Quantifying the effectiveness of HR interventions and smart recommendations.')}
            />
            <TabsContainer
                syncWithUrl="tab"
                tabs={renderTabs()}
            />
        </div>
    );
};

export default ImpactPage;
