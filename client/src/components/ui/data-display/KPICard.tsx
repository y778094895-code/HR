import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { cn } from '@/lib/utils';

export interface KPICardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    /**
     * Percentage change (e.g., 12.5, -5)
     */
    change?: number;
    /**
     * Trend direction. If not provided, derived from change (>0 up, <0 down)
     */
    trend?: 'up' | 'down' | 'neutral';
    /**
     * Contextual variant for coloring the trend
     */
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
    loading?: boolean;
    className?: string;
    footer?: string;
    valuePrefix?: string;
    valueSuffix?: string;
}

export function KPICard({
    title,
    value,
    icon: Icon,
    change,
    trend: explicitTrend,
    variant = 'default',
    loading = false,
    className,
    footer,
    valuePrefix,
    valueSuffix,
}: KPICardProps) {
    if (loading) {
        return (
            <Card className={cn("overflow-hidden", className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-1/2 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    // Determine trend if not explicitly provided
    let effectiveTrend = explicitTrend;
    if (!effectiveTrend && change !== undefined) {
        if (change > 0) effectiveTrend = 'up';
        else if (change < 0) effectiveTrend = 'down';
        else effectiveTrend = 'neutral';
    }

    const getTrendIcon = () => {
        if (effectiveTrend === 'up') return <ArrowUp className="h-4 w-4" />;
        if (effectiveTrend === 'down') return <ArrowDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (variant === 'success') return 'text-green-600 dark:text-green-500';
        if (variant === 'danger') return 'text-red-600 dark:text-red-500';
        if (variant === 'warning') return 'text-yellow-600 dark:text-yellow-500';

        // Default behavior: Up is green, Down is red (generic performance)
        // Note: For things like 'Attrition', user should pass variant='danger' for 'up' trend manually
        if (effectiveTrend === 'up') return 'text-green-600';
        if (effectiveTrend === 'down') return 'text-red-600';
        return 'text-muted-foreground';
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {valuePrefix}{value}{valueSuffix}
                </div>
                {(change !== undefined || effectiveTrend) && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span className={cn("flex items-center font-medium mr-2", getTrendColor())}>
                            {getTrendIcon()}
                            {change !== undefined && <span className="ml-1">{Math.abs(change)}%</span>}
                        </span>
                        {footer && <span>{footer}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
