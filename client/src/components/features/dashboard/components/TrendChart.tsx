import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface TrendChartProps {
    data: any[];
    loading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Card className="h-64">
                <CardHeader>
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="h-48">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-64 flex flex-col">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default TrendChart;
