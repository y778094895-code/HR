import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Badge } from '@/components/ui/data-display/badge';
import { RiskFactor } from '@/types/risk';

interface EmployeeRiskCardProps {
    employeeName: string;
    riskScore: number;
    contributingFactors: RiskFactor[];
}

const levelConfigs: Record<string, { color: string, label: string }> = {
    low: { color: 'bg-emerald-100 text-emerald-800', label: 'Low' },
    medium: { color: 'bg-amber-100 text-amber-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
};

const getLevel = (score: number) => {
    if (score > 0.9) return 'critical';
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
};

const EmployeeRiskCard: React.FC<EmployeeRiskCardProps> = ({ employeeName, riskScore, contributingFactors }) => {
    const level = getLevel(riskScore);
    const config = levelConfigs[level];

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">{employeeName}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={cn("px-2 py-1 rounded text-xs font-bold uppercase border-none", config.color)}>
                        {config.label}
                    </Badge>
                    <span className="text-3xl font-black text-gray-900">{Math.round(riskScore * 100)}%</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Key Risk Factors</h4>
                    <ul className="space-y-1.5">
                        {contributingFactors.map((f, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-indigo-500 mt-1">•</span>
                                <span>{f.factor}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default EmployeeRiskCard;
