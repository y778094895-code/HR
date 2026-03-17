import { useState, useEffect, useCallback } from 'react';
import { interventionService } from '@/services/resources/intervention.service';

export interface ImpactData {
    name: string;
    value: number;
}

import { ImpactStats } from '@/services/resources/types';

const useImpactAnalytics = () => {
    const [data, setData] = useState<ImpactData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const stats = await interventionService.getAnalytics();
            setData([
                { name: 'Total', value: stats.totalInterventions },
                { name: 'Completed', value: stats.completedCount },
                { name: 'Success %', value: Math.round(stats.successRate) }
            ]);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading
    };
};

export default useImpactAnalytics;
