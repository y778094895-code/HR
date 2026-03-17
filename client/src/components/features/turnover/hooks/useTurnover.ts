import { useEffect } from 'react';
import { useTurnoverStore } from '@/stores/business/turnover.store';
import { useToast } from '@/hooks/use-toast';

export const useTurnover = () => {
    const {
        risks,
        prediction,
        loading,
        error,
        fetchTurnoverData
    } = useTurnoverStore();

    const { toast } = useToast();

    useEffect(() => {
        // Initial fetch
        fetchTurnoverData();
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
        risks,
        prediction,
        loading,
        error,
        refresh: fetchTurnoverData,
    };
};

export default useTurnover;
