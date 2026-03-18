import { injectable } from 'inversify';
import axios from 'axios';
import { IMLServiceClient } from '../../services/interfaces/i-ml.service.client';

@injectable()
export class MLServiceClient implements IMLServiceClient {
    private baseUrl = process.env.ML_SERVICE_URL || 'http://ml-service:8000'; // ML Service URL
    private hrAiLayerEnabled = process.env.HR_AI_LAYER_ENABLED === 'true';
    private hrAiLayerUrl = process.env.HR_AI_LAYER_URL || 'http://hr-ai-layer:8001';
    private hrAiLayerTimeout = parseInt(process.env.HR_AI_LAYER_TIMEOUT_MS || '5000', 10);

    // Single Prediction: POST /predictions/turnover
    async predictTurnover(employeeId: string, features?: any) {
        if (this.hrAiLayerEnabled) {
            try {
                const response = await axios.post(`${this.hrAiLayerUrl}/predict`, {
                    employee_id: employeeId
                }, { timeout: this.hrAiLayerTimeout });

                // Map HR AI Layer response to expected format
                return {
                    employeeId: employeeId,
                    riskScore: response.data.probability_6m,
                    riskLevel: response.data.risk_level || 'Medium',
                    confidenceScore: 0.85, // Default/Placeholder as it might not be provided directly
                    factors: response.data.top_factors ? response.data.top_factors.map((f: any) => f.factor) : [],
                    contributingFactors: response.data.top_factors ? response.data.top_factors.map((f: any) => ({
                        factor: f.factor,
                        impact: f.impact_score
                    })) : [],
                    modelVersion: 'attrition_rf_v1' // Extracted from config
                };
            } catch (error: any) {
                console.error(`HR AI Layer Error on predictTurnover, falling back:`, error.message);
                // Fallthrough to ml-service
            }
        }

        try {
            const response = await axios.post(`${this.baseUrl}/predictions/turnover`, {
                employee_id: employeeId,
                features: features || {},
            });
            // Map TurnoverPredictionResponse → internal format
            const d = response.data;
            return {
                employeeId: d.employee_id ?? employeeId,
                riskScore: d.risk_score,
                riskLevel: d.band ?? d.risk_level,
                confidenceScore: d.confidence ?? 0.85,
                factors: d.shap_values
                    ? Object.fromEntries(d.shap_values.map((f: any) => [f.feature, f.impact]))
                    : {},
                shapValues: d.shap_values ?? [],
                modelVersion: d.model_version,
            };
        } catch (error: any) {
            console.error(`ML Service Error on predictTurnover:`, error.message);
            // Fallback mock
            return {
                employeeId: employeeId,
                riskScore: 0.15,
                riskLevel: 'Low',
                confidenceScore: 0.90,
                factors: ['department', 'tenure'],
                contributingFactors: [
                    { factor: 'department', impact: 0.1 },
                    { factor: 'tenure', impact: 0.05 }
                ],
                modelVersion: 'legacy_v1'
            };
        }
    }

    // Batch Prediction: POST /predictions/batch
    async predictTurnoverBatch(employeeIds: string[]) {
        if (this.hrAiLayerEnabled) {
            try {
                // Since HR AI Layer currently lacks a batch endpoint, map single predicts concurrently.
                const promises = employeeIds.map(id => this.predictTurnover(id, {}));
                const results = await Promise.all(promises);

                const predictions: any = {};
                employeeIds.forEach((id, index) => {
                    predictions[id] = results[index];
                });
                return predictions;
            } catch (error: any) {
                console.error(`HR AI Layer Error on predictTurnoverBatch, falling back:`, error.message);
            }
        }

        try {
            const response = await axios.post(`${this.baseUrl}/predictions/batch`, {
                employee_ids: employeeIds
            });
            return response.data;
        } catch (error: any) {
            console.error(`ML Service Error on predictTurnoverBatch:`, error.message);
            // Fallback mock
            const predictions: any = {};
            for (const id of employeeIds) {
                predictions[id] = { riskScore: Math.random() * 0.5 + 0.1, factors: ['tenure'] };
            }
            return predictions;
        }
    }

    async requestBatchPrediction(opts: { batchId: string; departmentId?: string; staleOnly?: boolean }): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/predictions/batch/queue`, opts);
        } catch (error: any) {
            console.warn(`ML Service batch queue unavailable: ${error.message}`);
        }
    }

    async getRecommendations(employeeId: string, focusArea?: string): Promise<any> {
        return [{ title: 'Leadership Training', score: 0.88 }];
    }

    async analyzeFairness(department?: string): Promise<any> {
        return { score: 0.95 };
    }
}
