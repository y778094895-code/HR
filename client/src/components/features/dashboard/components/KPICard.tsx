import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Skeleton } from '@/components/ui/feedback/skeleton';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    isPositive?: boolean;
    loading?: boolean;
    className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    isPositive,
    loading = false,
    className
}) => {
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                    {change && (
                        <span className={`ml-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '↑' : '↓'} {change}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default KPICard;
