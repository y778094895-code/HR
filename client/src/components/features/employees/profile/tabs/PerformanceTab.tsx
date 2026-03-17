import React from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Download, TrendingDown, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import { usePermissions } from '@/hooks/usePermissions';

interface PerformanceTabProps {
    profile: EmployeeProfileBundle;
}

export default function PerformanceTab({ profile }: PerformanceTabProps) {
    const { performance } = profile;
    const { canExportData, canViewExecutiveDashboards } = usePermissions();

    const handleDownloadReport = () => {
        // Create client-side CSV for demonstration
        const headers = ["Month", "Score"];
        const rows = (performance?.trend || []).map((t: any) => `${t.month},${t.score}`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Performance_Report_${(profile.employee?.fullName || 'Employee').replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Check if we have valid trend data
    const hasTrendData = performance?.trend && performance.trend.length > 0;

    return (
        <div className="space-y-6 mt-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold">Performance Analytics</h3>
                    <p className="text-sm text-muted-foreground">Historical performance metrics and KPI breakdown.</p>
                </div>
                {canExportData && hasTrendData && (
                    <Button variant="outline" className="gap-2" onClick={handleDownloadReport}>
                        <Download size={16} /> Download Report
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {canViewExecutiveDashboards ? (
                    <Card className="lg:col-span-3 bg-card shadow-sm border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Performance Trend Line</CardTitle>
                        </CardHeader>
                        <CardContent className="min-h-[300px]">
                            {hasTrendData ? (
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={performance.trend}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                                            />
                                            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                    <Activity size={48} className="opacity-30" />
                                    <p className="text-sm">No performance trend data available.</p>
                                    <p className="text-xs text-muted-foreground/70 max-w-xs text-center">
                                        Performance history will appear here once evaluation data is recorded.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="lg:col-span-3 bg-card shadow-sm border-border/60">
                        <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground">
                            Performance trend data restricted.
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    <Card className="bg-card shadow-sm border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Current Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{performance?.score ?? 'N/A'}</div>
                            <p className="text-xs text-muted-foreground mt-1">{performance?.rating || 'Latest evaluation score.'}</p>
                            {performance?.score && performance.score < 70 && (
                                <div className="mt-3 p-2 bg-destructive/10 rounded-lg flex items-start gap-2">
                                    <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-destructive/80">Score below threshold.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-sm border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {performance?.trend && performance.trend.length > 1 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {performance.trend[performance.trend.length - 1].score < performance.trend[performance.trend.length - 2].score ? (
                                            <>
                                                <TrendingDown size={20} className="text-destructive" />
                                                <span className="text-sm text-destructive">Declining</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp size={20} className="text-emerald-500" />
                                                <span className="text-sm text-emerald-500">Improving</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Based on last {performance.trend.length} evaluation(s).
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Insufficient data for trend analysis.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-sm border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">KPI Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {performance?.kpis && performance.kpis.length > 0 ? (
                                performance.kpis.map((kpi: any, idx: number) => (
                                    <div key={kpi.id || idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>{kpi.title || kpi.name || `KPI ${idx + 1}`}</span>
                                            <span className="font-bold">{kpi.value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${
                                                    (typeof kpi.value === 'number' && kpi.value >= 80) ? 'bg-emerald-500' :
                                                    (typeof kpi.value === 'number' && kpi.value >= 60) ? 'bg-amber-500' : 'bg-orange-500'
                                                }`} 
                                                style={{ width: `${typeof kpi.value === 'number' ? Math.min(kpi.value, 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    No KPI data available.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
