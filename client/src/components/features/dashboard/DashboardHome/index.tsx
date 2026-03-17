import * as React from "react";
import DashboardHome from './DashboardHome';
import useDashboardHome from '../hooks/useDashboardHome';

const DashboardHomeContainer: React.FC = () => {
    const {
        kpis,
        trends,
        loading,
        error,
        refreshData,
        selectedDateRange
    } = useDashboardHome();

    return (
        <DashboardHome
            kpis={kpis}
            trends={trends}
            loading={loading}
            error={error}
            onRefresh={refreshData}
            dateRange={selectedDateRange}
        />
    );
};

export default DashboardHomeContainer;
