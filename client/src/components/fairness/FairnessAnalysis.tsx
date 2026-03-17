import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface Metric {
    type: string;
    value: number;
    benchmark: number;
    status: string;
}

export default function FairnessAnalysis() {
    const [department, setDepartment] = useState('Engineering');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/fairness/analyze', { department }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMetrics(response.data);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Fairness & Equity Analysis</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Department Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Department Name"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                        <Button onClick={handleAnalyze} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Run Analysis'}
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mt-6">
                        {metrics.map((metric, idx) => (
                            <Card key={idx} className={metric.status !== 'FAIR' ? 'border-amber-500 bg-amber-50/50' : ''}>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        {metric.type.replace('_', ' ')}
                                    </div>
                                    <div className="text-2xl font-bold mt-2">
                                        {metric.value}%
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Benchmark: {metric.benchmark}%
                                    </div>
                                    <div className={`mt-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${metric.status === 'FAIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {metric.status}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
