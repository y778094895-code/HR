import * as React from 'react';
import { KPI } from '../hooks/useDashboardHome';
import KPICard from '../KPICard';
import TrendChart from '../TrendChart';
import { Button } from '@/components/ui/buttons/button';
import { RefreshCw } from 'lucide-react';

interface DashboardHomeProps {
    kpis: KPI[];
    trends: any[];
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
    dateRange: string;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
    kpis,
    trends,
    loading,
    error,
    onRefresh,
    dateRange
}) => {
    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border shadow-sm">
                        Last updated: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <KPICard key={i} title="Loading..." value="-" loading={true} />
                    ))
                ) : (
                    kpis.map(kpi => (
                        <KPICard
                            key={kpi.id}
                            title={kpi.title}
                            value={kpi.value}
                            change={kpi.change}
                            trend={kpi.trend}
                        />
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TrendChart
                        data={trends.map(t => t.value)}
                        labels={trends.map(t => t.label)}
                        loading={loading}
                    />
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
