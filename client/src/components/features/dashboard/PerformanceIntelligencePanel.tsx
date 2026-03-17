import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, AlertTriangle, ChevronLeft } from 'lucide-react';
import type { PerformanceData } from '@/types/dashboard.types';

// ---- SVG Trend Chart ----
function PerformanceTrendChart({ data }: { data: { month: string; score: number }[] }) {
    if (!data || data.length < 2) return null;
    const w = 480;
    const h = 140;
    const pad = 28;
    const scores = data.map(d => d.score);
    const min = Math.min(...scores) - 5;
    const max = Math.max(...scores) + 5;
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((d.score - min) / range) * (h - pad * 2);
        return { x, y, label: d.month, value: d.score };
    });

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${points[0].x},${h - pad} ${polyline} ${points[points.length - 1].x},${h - pad}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-label="Performance trend">
            <polygon points={area} className="dash-trend-area" />
            <polyline points={polyline} className="dash-trend-line" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} className="dash-trend-dot" />
                    <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">{p.value}</text>
                    <text x={p.x} y={h - 8} textAnchor="middle" className="fill-muted-foreground text-[9px]">{p.label}</text>
                </g>
            ))}
        </svg>
    );
}

// ---- Department Comparison Bars ----
function DepartmentBars({ departments }: { departments: { department: string; score: number; change: number }[] }) {
    const maxScore = Math.max(...departments.map(d => d.score), 100);

    return (
        <div className="space-y-2.5">
            {departments.map(dept => (
                <div key={dept.department} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 shrink-0 truncate text-end">{dept.department}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-primary/70 rounded-full transition-all duration-700"
                            style={{ width: `${(dept.score / maxScore) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-foreground">
                            {dept.score}
                        </span>
                    </div>
                    <span className={cn(
                        'text-xs font-medium flex items-center gap-0.5 w-14 shrink-0',
                        dept.change > 0 ? 'text-emerald-600' : dept.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                        {dept.change > 0 ? <ArrowUp className="h-3 w-3" /> : dept.change < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                        {Math.abs(dept.change)}%
                    </span>
                </div>
            ))}
        </div>
    );
}

// ---- Skeleton ----
function PerformancePanelSkeleton() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="dash-skeleton h-[220px]" />
            <div className="dash-skeleton h-[220px]" />
        </div>
    );
}

// ---- Props ----
interface PerformanceIntelligencePanelProps {
    data: PerformanceData | null;
    loading?: boolean;
    error?: string | null;
}

export default function PerformanceIntelligencePanel({ data, loading, error }: PerformanceIntelligencePanelProps) {
    const navigate = useNavigate();

    if (loading) return <PerformancePanelSkeleton />;
    if (error) return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
    );
    if (!data) return null;

    return (
        <section aria-label="Performance Intelligence">
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h2 className="dash-section-title">تحليل الأداء</h2>
                    <p className="dash-section-subtitle">اتجاهات الأداء ومقارنة الأقسام</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => navigate('/dashboard/performance')}
                >
                    تفاصيل كاملة
                    <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Trend */}
                <Card className="dash-card border bg-card">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">اتجاه الأداء (6 أشهر)</CardTitle>
                            {data.earlyDeclineDetected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    <AlertTriangle className="h-3 w-3" />
                                    تراجع مبكر
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PerformanceTrendChart data={data.trend} />
                        {data.earlyDeclineDetected && data.declineDescription && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-500/5 rounded-lg px-3 py-2">
                                ⚠️ {data.declineDescription}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Department Comparison */}
                <Card className="dash-card border bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">مقارنة أداء الأقسام</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentBars departments={data.departments} />
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
