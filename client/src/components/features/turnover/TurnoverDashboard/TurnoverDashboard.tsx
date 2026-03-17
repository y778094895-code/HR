import React from 'react';
import RiskMatrix from '../components/RiskMatrix';
import EmployeeRiskCard from '../components/EmployeeRiskCard';
import { Skeleton } from '@/components/ui/feedback/skeleton';

import { TurnoverRisk } from '@/types/risk';

interface TurnoverDashboardProps {
    risks: TurnoverRisk[];
    prediction: any;
    loading?: boolean;
}

const TurnoverDashboard: React.FC<TurnoverDashboardProps> = ({
    risks,
    prediction,
    loading = false
}) => {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Turnover Prediction</h1>
                <p className="text-gray-500">AI-powered attrition risk analysis and retention insights.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <RiskMatrix data={risks} loading={loading} />
                </div>
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading && risks.length === 0 ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-xl" />
                            ))
                        ) : (
                            risks.map((risk, idx) => (
                                <EmployeeRiskCard
                                    key={idx}
                                    employeeName={`Employee ${risk.employeeId}`}
                                    riskScore={risk.riskScore}
                                    contributingFactors={risk.contributingFactors || []}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TurnoverDashboard;
