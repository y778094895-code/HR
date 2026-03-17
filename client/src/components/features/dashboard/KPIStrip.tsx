import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/overlays/tooltip';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import type { DashboardKPI } from '@/types/dashboard.types';

// ---- Mini Sparkline (SVG) ----
function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 80;
    const h = 28;
    const pad = 2;

    const points = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return `${x},${y}`;
    });

    const polyline = points.join(' ');
    // Area fill: close the polygon at the bottom
    const area = `${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`;

    return (
        <svg className={cn('dash-sparkline', className)} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
            <polygon points={area} className="dash-sparkline-area" />
            <polyline points={polyline} className="dash-sparkline-line" />
        </svg>
    );
}

// ---- Skeleton ----
function KPIStripSkeleton() {
    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="dash-skeleton h-[130px]" />
            ))}
        </div>
    );
}

// ---- Error ----
function KPIStripError({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{message}</p>
        </div>
    );
}

// ---- Format large numbers ----
function formatValue(value: number, id: string): string {
    const safeValue = value ?? 0;
    if (id.includes('cost')) {
        return new Intl.NumberFormat('ar-SA', { notation: 'compact', compactDisplay: 'short' }).format(safeValue);
    }
    if (id.includes('fairness')) {
        return safeValue.toFixed(2);
    }
    if (safeValue < 100) {
        return safeValue % 1 === 0 ? String(safeValue) : safeValue.toFixed(1);
    }
    return new Intl.NumberFormat('ar-SA').format(safeValue);
}

// ---- Props ----
interface KPIStripProps {
    kpis: DashboardKPI[];
    loading?: boolean;
    error?: string | null;
}

export default function KPIStrip({ kpis, loading, error }: KPIStripProps) {
    const navigate = useNavigate();

    if (loading) return <KPIStripSkeleton />;
    if (error) return <KPIStripError message={error} />;
    if (!kpis || kpis.length === 0) return null;

    return (
        <section aria-label="Key Performance Indicators">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {kpis.map((kpi) => {
                    const isUp = kpi.changeDirection === 'up';
                    const isDown = kpi.changeDirection === 'down';
                    // Determine color: for attrition/risk, up is bad; for performance, up is good
                    const isNegativeMetric = kpi.id.includes('attrition') || kpi.id.includes('fairness');
                    const trendColorClass = isUp
                        ? isNegativeMetric ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        : isDown
                            ? isNegativeMetric ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            : 'text-muted-foreground';

                    return (
                        <Tooltip key={kpi.id}>
  <TooltipTrigger asChild>
    <button
      type="button"
      className="w-full text-start"
      aria-label={`${kpi.label}: ${kpi.value}`}
      onClick={() => navigate(kpi.deepLink)}
    >
      <Card className="dash-card dash-kpi-card border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
            {kpi.label}
          </CardTitle>
          <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-bold tracking-tight">
                {kpi.id.includes('cost') && (
                  <span className="text-base font-semibold me-0.5">﷼</span>
                )}
                {formatValue(kpi.value, kpi.id)}
                {kpi.id.includes('attrition') && kpi.id.includes('risk') && (
                  <span className="text-base">%</span>
                )}
              </div>

              <div className={cn('flex items-center gap-1 text-xs font-medium mt-1', trendColorClass)}>
                {isUp ? (
                  <ArrowUp className="h-3.5 w-3.5" />
                ) : isDown ? (
                  <ArrowDown className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                <span>{Math.abs(kpi.changePercent || 0)}%</span>
                <span className="text-muted-foreground font-normal">{kpi.changePeriod}</span>
              </div>
            </div>

            <MiniSparkline data={kpi.sparklineData} />
          </div>
        </CardContent>
      </Card>
    </button>
  </TooltipTrigger>

  <TooltipContent side="bottom" className="max-w-[240px] text-xs">
    {kpi.tooltip}
  </TooltipContent>
</Tooltip>
                    );
                })}
            </div>
        </section>
    );
}
