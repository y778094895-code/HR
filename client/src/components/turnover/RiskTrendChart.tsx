import React from 'react';

const RiskTrendChart: React.FC = () => {
    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Turnover Risk Trend</h3>
            <div className="h-48 bg-gray-50 flex items-end justify-between px-4 pb-2">
                {/* Mock Chart Bars */}
                <div className="w-8 bg-blue-200 h-1/4"></div>
                <div className="w-8 bg-blue-300 h-1/3"></div>
                <div className="w-8 bg-blue-400 h-1/2"></div>
                <div className="w-8 bg-blue-500 h-2/3"></div>
                <div className="w-8 bg-blue-600 h-3/4"></div>
                <div className="w-8 bg-blue-700 h-full"></div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400 uppercase">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
            </div>
        </div>
    );
};

export default RiskTrendChart;
