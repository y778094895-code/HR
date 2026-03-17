import * as React from 'react';
import { Card, CardContent } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Intervention } from '@/types/intervention';

interface InterventionsListProps {
    interventions: Intervention[];
    loading: boolean;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

const InterventionsList: React.FC<InterventionsListProps> = ({
    interventions,
    loading,
    onUpdateStatus
}) => {
    if (loading) return <p>Loading interventions...</p>;

    return (
        <div className="grid gap-4">
            {interventions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No active interventions found.
                    </CardContent>
                </Card>
            ) : (
                interventions.map((item) => {
                    const status = item.status.toLowerCase();
                    const priority = item.priority?.toLowerCase();
                    const dateToShow = item.dueDate || item.createdAt;

                    return (
                        <Card key={item.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {priority || 'medium'}
                                        </span>
                                        <h4 className="font-semibold text-lg">{item.type.replace(/_/g, ' ')}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                    {dateToShow && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.dueDate ? 'Due: ' : 'Created: '}
                                            {new Date(dateToShow).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                        ['active', 'in_progress'].includes(status) ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {status}
                                    </div>
                                    {status === 'planned' && (
                                        <Button size="sm" onClick={() => onUpdateStatus(item.id, 'in_progress')}>Start</Button>
                                    )}
                                    {['active', 'in_progress'].includes(status) && (
                                        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(item.id, 'completed')}>Complete</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
};

export default InterventionsList;
