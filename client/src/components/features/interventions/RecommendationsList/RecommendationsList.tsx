import React, { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import axios from 'axios';
import { useToast } from "@/components/ui/overlays/use-toast";
import { RecommendationCard, Recommendation } from '../RecommendationCard/RecommendationCard';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '@/stores/business/case.store';


export default function RecommendationsList() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { addCase } = useCaseStore();


    const fetchRecommendations = async () => {
        try {
            const response = await axios.get('/api/recommendations');
            setRecommendations(response.data);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const handleAction = async (id: string, action: 'accept' | 'reject' | 'apply') => {
        try {
            await axios.post(`/api/recommendations/${id}/${action}`);
            toast({
                title: `Recommendation ${action}ed`,
                description: `Successfully ${action}ed the recommendation.`,
            });

            if (action === 'apply') {
                const rec = recommendations.find(r => r.id === id);
                if (rec) {
                    addCase({
                        title: `تنفيذ توصية: ${rec.title}`,
                        description: `المبرر (AI Logic): ${rec.logic}`,
                        priority: 'high',
                        employeeId: rec.employeeId,
                    });
                    navigate('/dashboard/cases');
                }
            } else {
                fetchRecommendations();
            }

        } catch (error) {
            toast({
                title: "Action failed",
                description: "Failed to process recommendation action.",
                variant: "destructive"
            });
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
                <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onAction={handleAction}
                />
            ))}
            {recommendations.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No recommendations found.</p>}
        </div>
    );
}
