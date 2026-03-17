import React from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/cards/card';
import { Badge } from '@/components/ui/data-display/badge';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { RestrictedView } from '@/components/shared/RestrictedView';

interface ImpactTabProps {
    profile: EmployeeProfileBundle;
}

export default function ImpactTab({ profile }: ImpactTabProps) {
    const { canViewExecutiveDashboards } = usePermissions();
    
    // Get real data from profile - only use backend-provided analytics
    const interventions = profile.impact?.interventions || [];
    const analytics = profile.impact?.analytics;
    
    // Check if we have real backend analytics data
    const hasRealAnalytics = analytics && (
        analytics.totalInterventions !== undefined ||
        analytics.riskReduction !== undefined ||
        analytics.successRate !== undefined
    );

    return (
        <div className="space-y-6 mt-4">
            {!canViewExecutiveDashboards ? (
                <RestrictedView
                    title="تحليل الأثر مقيد"
                    message="ليس لديك صلاحيات لاستعراض تحليل العائد على الاستثمار واستراتيجيات التدخل."
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-card shadow-sm border-border/60 col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Intervention Impact Analysis</CardTitle>
                            <CardDescription>Impact metrics require backend analytics integration.</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[300px]">
                            {interventions.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        {interventions.length} intervention(s) on record. Detailed impact analysis 
                                        requires backend analytics to be enabled.
                                    </p>
                                    {/* Show simple list instead of chart to avoid -1 dimension warnings */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {interventions.slice(0, 4).map((intv: any, idx: number) => (
                                            <div key={intv.id || idx} className="p-3 border rounded-lg">
                                                <p className="font-medium text-sm">{intv.type || 'Intervention'}</p>
                                                <Badge variant="outline" className="mt-1">
                                                    {intv.status || 'Unknown'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                    <BarChart3 size={48} className="opacity-30" />
                                    <p className="text-sm">No intervention impact data available.</p>
                                    <p className="text-xs text-muted-foreground/70 max-w-xs text-center">
                                        Impact analytics will appear here once interventions are recorded and backend analytics are enabled.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-card shadow-sm border-border/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Overall Effectiveness</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasRealAnalytics ? (
                                    <>
                                        <div className="text-4xl font-bold flex items-center gap-2 text-emerald-500">
                                            <ArrowUpRight size={32} />
                                            {analytics?.riskReduction?.toFixed(0) ?? 0}%
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Average risk reduction across all applied interventions.
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground py-4">
                                        {interventions.length > 0 
                                            ? "Impact metrics pending backend analytics."
                                            : "No intervention data available."}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-card shadow-sm border-border/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Linked Case ROI</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {interventions.length > 0 ? (
                                    interventions.slice(0, 3).map((intv: any, idx: number) => (
                                        <div key={intv.id || idx} className="flex justify-between items-center pb-2 border-b">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {intv.id?.substring(0, 8) || `INT-${idx + 1}`}
                                                </Badge>
                                                <p className="text-xs font-semibold mt-1">{intv.type || 'Intervention'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs font-bold flex items-center justify-end ${
                                                    intv.status === 'completed' ? 'text-emerald-500' : 'text-orange-500'
                                                }`}>
                                                    {intv.status === 'completed' ? (
                                                        <><ArrowUpRight size={12} /> Completed</>
                                                    ) : (
                                                        <><Activity size={12} /> In Progress</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                        No interventions linked.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
