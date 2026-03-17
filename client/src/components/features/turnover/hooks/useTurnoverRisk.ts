import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/overlays/use-toast';
import { turnoverService } from '@/services/resources/turnover.service';

export interface RiskData {
    employeeId: string;
    riskScore: number;
    riskLevel: string;
    contributingFactors: string[];
    retentionProbability: number;
}

const useTurnoverRisk = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [data, setData] = useState<RiskData | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const predictRisk = useCallback(async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            const data = await turnoverService.predictRisk(employeeId);
            setData(data as any);//sssssssssssssss
        } catch (error: any) {
            console.error("Prediction failed", error);
            toast({
                title: "Error",
                description: "Prediction failed",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [employeeId, toast]);

    return {
        employeeId,
        setEmployeeId,
        data,
        loading,
        predictRisk
    };
};

export default useTurnoverRisk;
