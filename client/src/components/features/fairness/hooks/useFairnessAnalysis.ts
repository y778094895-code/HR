import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/overlays/use-toast';
import { fairnessService } from '@/services/resources/fairness.service';

export interface Metric {
    type: string;
    value: number;
    benchmark: number;
    status: string;
}

const useFairnessAnalysis = () => {
    const [department, setDepartment] = useState('Engineering');
    const [metrics, setMetrics] = useState<any[]>([]);//ssssss
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const analyzeFairness = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fairnessService.analyzeDepartment(department);
            setMetrics(data);
        } catch (error: any) {
            console.error("Analysis failed", error);
            toast({
                title: "Error",
                description: "Fairness analysis failed",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [department, toast]);

    return {
        department,
        setDepartment,
        metrics,
        loading,
        analyzeFairness
    };
};

export default useFairnessAnalysis;
