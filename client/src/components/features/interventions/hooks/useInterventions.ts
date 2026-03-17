import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/overlays/use-toast';
import { interventionService } from '@/services/resources/intervention.service';

import { Intervention } from '@/services/resources/types';

const useInterventions = () => {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchInterventions = useCallback(async () => {
        try {
            const data = await interventionService.getInterventions();
            setInterventions(data.data || data as any);//sssssssssssssss
        } catch (error) {
            console.error("Failed to fetch interventions", error);
            toast({
                title: "Error",
                description: "Failed to fetch interventions",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchInterventions();
    }, [fetchInterventions]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await interventionService.updateStatus(id, newStatus);
            fetchInterventions();
        } catch (error) {
            console.error("Failed to update status", error);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            });
        }
    };

    return {
        interventions,
        loading,
        updateStatus
    };
};

export default useInterventions;
