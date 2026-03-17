import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/cards/card';
import { Skeleton } from '@/components/ui/feedback/skeleton';

interface RiskMatrixProps {
    data: any[];
    loading?: boolean;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ data, loading = false }) => {
    if (loading) {
        return <Skeleton className="h-64 w-full rounded-xl" />;
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Turnover Risk Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 h-48">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col justify-center items-center">
                        <span className="text-3xl font-bold text-red-600">High Risk</span>
                        <span className="text-sm text-red-400 font-medium">{data.filter(d => d.riskScore > 0.7).length} Employees</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col justify-center items-center">
                        <span className="text-3xl font-bold text-amber-600">Medium Risk</span>
                        <span className="text-sm text-amber-400 font-medium">{data.filter(d => d.riskScore > 0.4 && d.riskScore <= 0.7).length} Employees</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RiskMatrix;
