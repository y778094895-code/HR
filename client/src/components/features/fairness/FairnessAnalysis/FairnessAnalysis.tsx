import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Metric } from '../hooks/useFairnessAnalysis';

interface FairnessAnalysisProps {
    department: string;
    metrics: Metric[];
    loading: boolean;
    onDepartmentChange: (value: string) => void;
    onAnalyze: () => void;
}

const FairnessAnalysis: React.FC<FairnessAnalysisProps> = ({
    department,
    metrics,
    loading,
    onDepartmentChange,
    onAnalyze
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Fairness & Equity Analysis</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Department Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Department Name"
                            value={department}
                            onChange={(e) => onDepartmentChange(e.target.value)}
                        />
                        <Button onClick={onAnalyze} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Run Analysis'}
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mt-6">
                        {metrics.map((metric, idx) => (
                            <Card key={idx} className={metric.status !== 'FAIR' ? 'border-amber-500 bg-amber-50/50' : ''}>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        {metric.type.replace('_', ' ')}
                                    </div>
                                    <div className="text-2xl font-bold mt-2">
                                        {metric.value}%
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Benchmark: {metric.benchmark}%
                                    </div>
                                    <div className={`mt-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${metric.status === 'FAIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {metric.status}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FairnessAnalysis;
