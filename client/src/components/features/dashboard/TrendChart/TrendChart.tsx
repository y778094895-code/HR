import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { cn } from '@/lib/utils';

export interface TrendChartProps {
    data: number[];
    labels?: string[];
    title?: string;
    className?: string;
    loading?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
    data,
    labels,
    title = "Performance Over Time",
    className,
    loading = false
}) => {
    if (loading) {
        return (
            <Card className={cn("h-full animate-pulse", className)}>
                <CardHeader>
                    <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-100 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    const maxVal = Math.max(...data, 1); // Avoid division by zero

    return (
        <Card className={cn("h-full", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex flex-col justify-end">
                    <div className="flex items-end space-x-2 px-2 h-full">
                        {data.map((value, index) => {
                            const heightPercentage = (value / maxVal) * 100;
                            return (
                                <div
                                    key={index}
                                    className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all relative group"
                                    style={{ height: `${heightPercentage}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none">
                                        {value}
                                        {labels && labels[index] && <div className="text-[10px] text-gray-300">{labels[index]}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {labels && (
                        <div className="flex justify-between mt-2 px-2 text-xs text-muted-foreground">
                            {labels.map((label, i) => (
                                <div key={i} className="flex-1 text-center truncate">{label}</div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TrendChart;
