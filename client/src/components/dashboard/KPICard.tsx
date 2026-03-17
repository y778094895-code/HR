import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    isPositive?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, isPositive }) => {
    return (
        <div className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h4>
            <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {change && (
                    <span className={`ml-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '↑' : '↓'} {change}
                    </span>
                )}
            </div>
        </div>
    );
};

export default KPICard;
