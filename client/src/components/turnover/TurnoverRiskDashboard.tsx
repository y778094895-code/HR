import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface RiskData {
    employeeId: string;
    riskScore: number;
    riskLevel: string;
    contributingFactors: string[];
    retentionProbability: number;
}

export default function TurnoverRiskDashboard() {
    const [employeeId, setEmployeeId] = useState('');
    const [data, setData] = useState<RiskData | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/turnover-risk/predict/${employeeId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error("Prediction failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Turnover Risk Analysis</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Predict Employee Risk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Enter Employee ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                        />
                        <Button onClick={handlePredict} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Predict Risk'}
                        </Button>
                    </div>

                    {data && (
                        <div className="mt-6 border rounded-lg p-6 bg-slate-50 dark:bg-slate-900">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Risk Score</h4>
                                    <div className="text-4xl font-bold mt-2 text-rose-600">
                                        {data.riskScore}%
                                    </div>
                                    <div className="mt-1 badge px-2 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold inline-block">
                                        {data.riskLevel}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Retention Probability</h4>
                                    <div className="text-4xl font-bold mt-2 text-emerald-600">
                                        {data.retentionProbability}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Contributing Factors</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {data.contributingFactors.map((factor, i) => (
                                        <li key={i} className="text-sm">{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
