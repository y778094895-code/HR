import { useEffect } from 'react';
import { useFairnessStore } from '@/stores/business/fairness.store';
import { useToast } from '@/hooks/use-toast';

export const useFairness = () => {
    const {
        metrics,
        analysis,
        loading,
        error,
        fetchFairnessData
    } = useFairnessStore();

    const { toast } = useToast();

    useEffect(() => {
        // Initial fetch
        // Similar to other hooks, we can check if data exists or logic to force refresh
        fetchFairnessData();
    }, []);

    useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, toast]);

    return {
        metrics,
        analysis,
        loading,
        error,
        refresh: fetchFairnessData,
    };
};

export default useFairness;
