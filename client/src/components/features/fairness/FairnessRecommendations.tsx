import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/buttons/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { fairnessService } from '@/services/resources/fairness.service';

interface Recommendation {
    id: string;
    title: string;
    impact: 'High' | 'Medium';
    description: string;
    category: 'Hiring' | 'Compensation' | 'Reviews';
}

export function FairnessRecommendations() {
    const [recs, setRecs] = useState<Recommendation[]>([]);

    useEffect(() => {
        fairnessService.getFairnessRecommendations()
            .then(res => {
                const mapped = (res || []).map((r: any) => ({
                    id: r.id,
                    title: 'Fairness Recommendation', // Domain type lacks title, usually inferred or fixed
                    impact: (r.impact === 'high' ? 'High' : 'Medium') as 'High' | 'Medium',
                    description: r.description || 'Review the system for biases.',
                    category: (r.type === 'compensation' ? 'Compensation' : r.type === 'hiring' ? 'Hiring' : 'Reviews') as 'Compensation' | 'Hiring' | 'Reviews'
                }));
                setRecs(mapped);
            })
            .catch(err => console.error('Failed to fetch fairness recommendations:', err));
    }, []);

    return (
        <div className="space-y-4">
            {recs.map((rec) => (
                <div key={rec.id} className="p-6 border rounded-xl bg-card shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rec.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {rec.impact} Impact
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{rec.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold">{rec.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">{rec.description}</p>
                    </div>

                    <Button className="shrink-0">
                        Implement Action
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ))}

            {recs.length === 0 && (
                <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No major fairness issues detected at this time. Live sync verified.</p>
                </div>
            )}
        </div>
    );
}
