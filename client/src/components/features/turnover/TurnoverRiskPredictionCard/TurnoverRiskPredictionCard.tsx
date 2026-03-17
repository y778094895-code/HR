import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { cn } from '@/lib/utils';

import { TurnoverRisk, RiskFactor } from '@/types/risk';

export interface TurnoverRiskPredictionCardProps {
    employeeId: string;
    onEmployeeIdChange: (id: string) => void;
    onPredict: () => void;
    loading?: boolean;
    data?: TurnoverRisk | null;
    className?: string;
}

export const TurnoverRiskPredictionCard: React.FC<TurnoverRiskPredictionCardProps> = ({
    employeeId,
    onEmployeeIdChange,
    onPredict,
    loading = false,
    data,
    className
}) => {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Predict Employee Risk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <Input
                        placeholder="Enter Employee ID"
                        value={employeeId}
                        onChange={(e) => onEmployeeIdChange(e.target.value)}
                    />
                    <Button onClick={onPredict} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Predict Risk'}
                    </Button>
                </div>

                {data && (
                    <div className="mt-6 border rounded-lg p-6 bg-slate-50 dark:bg-slate-900">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Risk Score</h4>
                                <div className={cn(
                                    "text-4xl font-bold mt-2",
                                    (data.riskScore * 100) > 70 ? "text-rose-600" :
                                        (data.riskScore * 100) > 40 ? "text-amber-600" :
                                            "text-emerald-600"
                                )}>
                                    {Math.round(data.riskScore * 100)}%
                                </div>
                                <div className={cn(
                                    "mt-1 badge px-2 py-1 rounded text-xs font-bold inline-block",
                                    data.riskLevel === 'High' ? "bg-rose-100 text-rose-800" :
                                        data.riskLevel === 'Medium' ? "bg-amber-100 text-amber-800" :
                                            "bg-emerald-100 text-emerald-800"
                                )}>
                                    {data.riskLevel}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Retention Probability</h4>
                                <div className="text-4xl font-bold mt-2 text-emerald-600">
                                    {Math.round((1 - data.riskScore) * 100)}%
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Contributing Factors</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {data.contributingFactors.map((f, i) => (
                                    <li key={i} className="text-sm">{f.factor}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TurnoverRiskPredictionCard;
