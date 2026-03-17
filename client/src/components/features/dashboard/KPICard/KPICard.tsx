import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export interface KPICardProps {
    title: string;
    value: string | number;
    change?: string | number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    loading?: boolean;
    className?: string;
    description?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    trend,
    icon,
    loading = false,
    className,
    description
}) => {
    if (loading) {
        return (
            <Card className={cn("animate-pulse", className)}>
                <CardHeader className="pb-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-1/2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(change !== undefined || description) && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                        {change !== undefined && (
                            <span className={cn(
                                "flex items-center mr-2",
                                trend === 'up' ? "text-green-600" :
                                    trend === 'down' ? "text-red-600" :
                                        "text-gray-600"
                            )}>
                                {trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                                {trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                                {trend === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                                {change}
                            </span>
                        )}
                        {description && <span>{description}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default KPICard;
