import { useState, useCallback } from 'react';
import { interventionsApi, Intervention } from '../lib/api/interventions';

export const useInterventions = () => {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInterventions = useCallback(async (params?: any) => {
        setLoading(true);
        try {
            const res = await interventionsApi.findAll(params);
            // Handle ApiResponse wrapping if present
            const payload = (res as any).data || res;
            const items = payload.items || payload || [];
            setInterventions(items);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch interventions');
        } finally {
            setLoading(false);
        }
    }, []);

    const createIntervention = async (data: any) => {
        const res = await interventionsApi.create(data);
        const newItem = (res as any).data || res;
        setInterventions(prev => [newItem, ...prev]);
        return newItem;
    };

    const updateIntervention = async (id: string, data: any) => {
        const res = await interventionsApi.update(id, data);
        const updated = (res as any).data || res;
        setInterventions(prev => prev.map(i => i.id === id ? updated : i));
        return updated;
    };

    return {
        interventions,
        loading,
        error,
        fetchInterventions,
        createIntervention,
        updateIntervention
    };
};
