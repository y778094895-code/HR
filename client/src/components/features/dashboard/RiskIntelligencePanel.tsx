import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import type { RiskData, RiskEmployee } from '@/types/dashboard.types';

// ---- SVG Trend Line ----
function TrendLine({ data }: { data: { month: string; score: number }[] }) {
    if (!data || data.length < 2) return null;
    const w = 400;
    const h = 120;
    const pad = 24;
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
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-label="Risk trend chart">
            <polygon points={area} className="dash-trend-area" />
            <polyline points={polyline} className="dash-trend-line" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} className="dash-trend-dot" />
                    <text x={p.x} y={h - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">{p.label}</text>
                </g>
            ))}
        </svg>
    );
}

// ---- Distribution Bars ----
function DistributionBars({ distribution }: { distribution: { high: number; medium: number; low: number } }) {
    const total = distribution.high + distribution.medium + distribution.low;
    if (total === 0) return null;

    const segments = [
        { label: 'مرتفع', value: distribution.high, color: 'bg-red-500', pct: (distribution.high / total) * 100 },
        { label: 'متوسط', value: distribution.medium, color: 'bg-amber-500', pct: (distribution.medium / total) * 100 },
        { label: 'منخفض', value: distribution.low, color: 'bg-emerald-500', pct: (distribution.low / total) * 100 },
    ];

    return (
        <div className="space-y-3">
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                {segments.map(s => (
                    <div key={s.label} className={cn('dash-distribution-bar h-full', s.color)} style={{ width: `${s.pct}%` }} />
                ))}
            </div>
            <div className="flex justify-between text-xs">
                {segments.map(s => (
                    <div key={s.label} className="flex items-center gap-1.5">
                        <span className={cn('w-2.5 h-2.5 rounded-full', s.color)} />
                        <span className="text-muted-foreground">{s.label}: <span className="font-semibold text-foreground">{s.value}%</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---- Heatmap Grid ----
function HeatmapGrid({ cells }: { cells: { department: string; level: string; score: number }[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cells.map(cell => (
                <div key={cell.department} className="dash-heatmap-cell" data-level={cell.level}>
                    <div className="font-semibold text-sm truncate">{cell.department}</div>
                    <div className="text-lg font-bold mt-0.5">{cell.score}%</div>
                </div>
            ))}
        </div>
    );
}

// ---- Skeleton ----
function RiskPanelSkeleton() {
    return (
        <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4">
                <div className="dash-skeleton h-[160px]" />
                <div className="dash-skeleton h-[60px]" />
                <div className="dash-skeleton h-[140px]" />
            </div>
            <div className="lg:col-span-4">
                <div className="dash-skeleton h-[370px]" />
            </div>
        </div>
    );
}

// ---- Props ----
interface RiskIntelligencePanelProps {
    data: RiskData | null;
    loading?: boolean;
    error?: string | null;
    onOpenDrawer: (employee: RiskEmployee) => void;
}

export default function RiskIntelligencePanel({ data, loading, error, onOpenDrawer }: RiskIntelligencePanelProps) {
    if (loading) return <RiskPanelSkeleton />;
    if (error) return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
    );
    if (!data) return null;

    return (
        <section aria-label="Risk Intelligence">
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h2 className="dash-section-title">تحليل المخاطر الذكي</h2>
                    <p className="dash-section-subtitle">رصد وتحليل مخاطر الاستقالة على مستوى المنظمة</p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                {/* Left: Charts (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Heatmap */}
                    <Card className="dash-card border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">خريطة المخاطر حسب القسم</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HeatmapGrid cells={data.heatmap} />
                        </CardContent>
                    </Card>

                    {/* Distribution */}
                    <Card className="dash-card border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">توزيع مستويات الخطر</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DistributionBars distribution={data.distribution} />
                        </CardContent>
                    </Card>

                    {/* Trend */}
                    <Card className="dash-card border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">اتجاه المخاطر (6 أشهر)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendLine data={data.trend} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Top 10 Table (4 cols) */}
                <div className="lg:col-span-4">
                    <Card className="dash-card border bg-card h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">أعلى 10 موظفين خطراً</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="overflow-auto max-h-[500px]">
                                <table className="w-full text-sm" role="table">
                                    <thead>
                                        <tr className="border-b text-xs text-muted-foreground">
                                            <th className="text-start px-4 py-2 font-medium">الاسم</th>
                                            <th className="text-start px-2 py-2 font-medium">الخطر</th>
                                            <th className="text-start px-2 py-2 font-medium">السبب</th>
                                            <th className="px-2 py-2 font-medium" aria-label="Actions"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.topEmployees.map((emp) => (
                                            <tr
                                                key={emp.id}
                                                className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                                                onClick={() => onOpenDrawer(emp)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') onOpenDrawer(emp); }}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={`عرض تفاصيل ${emp.name}`}
                                            >
                                                <td className="px-4 py-2.5">
                                                    <div className="font-medium text-sm truncate max-w-[120px]">{emp.name}</div>
                                                    <div className="text-[11px] text-muted-foreground">{emp.department}</div>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <span className={cn(
                                                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold',
                                                        emp.riskScore >= 70 ? 'dash-severity-critical' :
                                                            emp.riskScore >= 50 ? 'dash-severity-high' : 'dash-severity-medium'
                                                    )}>
                                                        {emp.riskScore}%
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5 text-xs text-muted-foreground truncate max-w-[100px]">
                                                    {emp.primaryDriver}
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={(e) => { e.stopPropagation(); onOpenDrawer(emp); }}
                                                        aria-label={`فتح تفاصيل ${emp.name}`}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
