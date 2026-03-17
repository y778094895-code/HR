import { RiskFactor } from '@/types/risk';

interface EmployeeRiskCardProps {
    employeeName: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    contributingFactors: RiskFactor[];
}

const EmployeeRiskCard: React.FC<EmployeeRiskCardProps> = ({ employeeName, riskScore, riskLevel, contributingFactors }) => {
    const levelColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{employeeName}</h3>
            <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${levelColors[riskLevel]}`}>
                    {riskLevel}
                </span>
                <span className="text-2xl font-bold">{Math.round(riskScore * 100)}%</span>
            </div>
            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase">Key Factors</h4>
                <ul className="mt-2 space-y-1">
                    {contributingFactors.map((factor, i) => (
                        <li key={i} className="text-sm text-gray-700">• {factor.factor}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default EmployeeRiskCard;
