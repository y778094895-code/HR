import React from 'react';
import ImpactSummaryChart from './ImpactSummaryChart';
import useImpactAnalytics from '../hooks/useImpactAnalytics';

const ImpactSummaryChartContainer: React.FC = () => {
    const { data, loading } = useImpactAnalytics();

    return <ImpactSummaryChart data={data} loading={loading} />;
};

export default ImpactSummaryChartContainer;
