import React from 'react';
import { KPICard } from '@/components/ui/data-display/KPICard';
import { Award, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export function PerformanceOverview() {
    // Mock Data
    const kpis = [
        { title: 'Avg Organization Score', value: 4.2, change: 0.3, icon: Award, variant: 'default' as const },
        { title: 'Review Completion', value: 94, change: 2.1, icon: CheckCircle, variant: 'success' as const, suffix: '%' },
        { title: 'Top Performers', value: 45, change: 5.0, icon: TrendingUp, variant: 'success' as const },
        { title: 'Active PIPs', value: 8, change: -1.0, icon: AlertTriangle, variant: 'warning' as const },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, index) => (
                    <KPICard
                        key={index}
                        title={kpi.title}
                        value={kpi.value}
                        change={kpi.change}
                        icon={kpi.icon}
                        variant={kpi.variant}
                        valueSuffix={kpi.suffix}
                    />
                ))}
            </div>

            {/* Charts Section Placeholder */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground">
                        Bar Chart Component Available Soon
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance vs Potential (9-Box)</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground">
                        Scatter Plot Component Available Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
