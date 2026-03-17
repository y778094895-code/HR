import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface Intervention {
    id: string;
    employeeId: string;
    type: string;
    status: string;
    priority: string;
    notes: string;
    createdAt: string;
}

export default function InterventionsList() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInterventions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/interventions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterventions(response.data);
        } catch (error) {
            console.error("Failed to fetch interventions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterventions();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/interventions/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInterventions();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (loading) return <p>Loading interventions...</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Interventions & Action Plans</h2>

            <div className="grid gap-4">
                {interventions.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No active interventions found.
                        </CardContent>
                    </Card>
                ) : (
                    interventions.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {item.priority}
                                        </span>
                                        <h4 className="font-semibold text-lg">{item.type.replace('_', ' ')}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                                    <p className="text-xs text-muted-foreground">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                        item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {item.status}
                                    </div>
                                    {item.status === 'PENDING' && (
                                        <Button size="sm" onClick={() => handleStatusUpdate(item.id, 'ACTIVE')}>Start</Button>
                                    )}
                                    {item.status === 'ACTIVE' && (
                                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(item.id, 'COMPLETED')}>Complete</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
