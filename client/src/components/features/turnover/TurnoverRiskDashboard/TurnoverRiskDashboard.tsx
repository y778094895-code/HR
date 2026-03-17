import React, { useState } from 'react';
import axios from 'axios';
import { TurnoverRiskPredictionCard } from '../TurnoverRiskPredictionCard/TurnoverRiskPredictionCard';
import { TurnoverRisk } from '@/types/risk';

export default function TurnoverRiskDashboard() {
    const [employeeId, setEmployeeId] = useState('');
    const [data, setData] = useState<TurnoverRisk | null>(null);
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

            <TurnoverRiskPredictionCard
                employeeId={employeeId}
                onEmployeeIdChange={setEmployeeId}
                onPredict={handlePredict}
                loading={loading}
                data={data}
            />
        </div>
    );
}
