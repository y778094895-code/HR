import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/cards/card';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { cn } from '@/lib/utils';

export interface EquityData {
    category: string;
    avgSalary: string | number;
    avgRating: string | number;
    gap: string | number;
}

export interface EquityMatrixProps {
    data: EquityData[];
    loading?: boolean;
}

const EquityMatrix: React.FC<EquityMatrixProps> = ({ data, loading = false }) => {
    if (loading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Pay & Performance Equity Matrix</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Category</th>
                            <th className="px-4 py-2 text-right font-medium uppercase tracking-wider">Avg Salary</th>
                            <th className="px-4 py-2 text-right font-medium uppercase tracking-wider">Avg Rating</th>
                            <th className="px-4 py-2 text-right font-medium uppercase tracking-wider">Gap</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">{row.category}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{row.avgSalary}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{row.avgRating}</td>
                                <td className={cn(
                                    "px-4 py-3 text-right font-semibold",
                                    row.gap.toString().includes('-') ? "text-red-600" : "text-emerald-600"
                                )}>
                                    {row.gap}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
};

export default EquityMatrix;
