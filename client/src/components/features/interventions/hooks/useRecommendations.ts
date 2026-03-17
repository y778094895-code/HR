import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/overlays/use-toast';
import { interventionService } from '@/services/resources/intervention.service';

import { Recommendation } from '@/services/resources/types';

const useRecommendations = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchRecommendations = useCallback(async () => {
        try {
            const data = await interventionService.getRecommendations();
            setRecommendations(data);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
            toast({
                title: "Error",
                description: "Failed to fetch recommendations",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const handleAction = async (id: string, action: 'accept' | 'reject' | 'apply') => {
        try {
            await interventionService.handleRecommendationAction(id, action);
            toast({
                title: `Recommendation ${action}ed`,
                description: `Successfully ${action}ed the recommendation.`,
            });
            fetchRecommendations();
        } catch (error) {
            toast({
                title: "Action failed",
                description: "Failed to process recommendation action.",
                variant: "destructive"
            });
        }
    };

    return {
        recommendations,
        loading,
        handleAction
    };
};

export default useRecommendations;
