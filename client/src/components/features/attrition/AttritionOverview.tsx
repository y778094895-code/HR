import React from 'react';
import { KPICard } from '@/components/ui/data-display/KPICard';
import { TrendingDown, Users, DollarSign, AlertTriangle } from 'lucide-react';

export function AttritionOverview() {
    // Mock Data
    const kpis = [
        { title: 'Turnover Rate', value: 12.5, change: -1.2, icon: TrendingDown, variant: 'default' as const, suffix: '%' },
        { title: 'Predicted Attrition', value: 35, change: 5.0, icon: Users, variant: 'danger' as const, suffix: ' Emps' },
        { title: 'Est. Cost of Attrition', value: 450000, change: 15.0, icon: DollarSign, variant: 'warning' as const, prefix: '$' },
        { title: 'Interventions Active', value: 12, change: 2.0, icon: AlertTriangle, variant: 'success' as const },
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
                        valuePrefix={kpi.prefix}
                    />
                ))}
            </div>

            {/* Charts Section Placeholder */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Turnover by Department</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground">
                        Bar Chart Component Available Soon
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Risk Drivers (XAI)</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground">
                        Radar Chart Component Available Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
