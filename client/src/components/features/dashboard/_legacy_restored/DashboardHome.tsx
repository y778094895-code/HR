import * as React from "react";
// import KPICard from './KPICard'; // TODO: KPICard was lost in migration. Use new feature component or restore manually.
import TrendChart from './TrendChart';

const DashboardHome: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border shadow-sm">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* <KPICard title="Total Employees" value="1,248" change="2.4%" isPositive={true} />
                <KPICard title="Retention Rate" value="94.2%" change="1.1%" isPositive={true} />
                <KPICard title="Avg Performance" value="4.1 / 5" change="0.3" isPositive={true} />
                <KPICard title="Turnover Risk" value="12%" change="4.1%" isPositive={false} /> */}
                <div className="p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                    KPICard component missing. Please update to use feature component.
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TrendChart />
                </div>
                <div className="p-6 border rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl">
                    <h3 className="text-xl font-bold mb-4">AI Insight</h3>
                    <p className="opacity-90 leading-relaxed">
                        Turnover risk is concentrated in the <span className="font-bold underline decoration-2">Customer Success</span> department.
                        Recommend initiating retention surveys for mid-level managers.
                    </p>
                    <button className="mt-6 w-full py-3 bg-white text-indigo-700 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                        Generate Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
