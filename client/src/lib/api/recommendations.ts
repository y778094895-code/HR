import { apiGet, apiPost } from '../api';

export interface Recommendation {
    id: string;
    employeeId?: string;
    department?: string;
    source: 'ml' | 'rule' | 'manual';
    recommendationType: string;
    title: string;
    description: string;
    confidence: number;
    estimatedImpact?: any;
    status: 'active' | 'accepted' | 'rejected' | 'applied' | 'expired';
    reasonCodes?: any;
    metadata?: any;
    createdAt: string;
}

export const recommendationsApi = {
    findAll: async (params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiGet<Recommendation[]>(`/recommendations${query}`);
    },
    findOne: async (id: string) => {
        return apiGet<Recommendation>(`/recommendations/${id}`);
    },
    generate: async (employeeId: string, focusArea?: string) => {
        return apiPost<Recommendation[]>(`/recommendations/generate/${employeeId}`, { focusArea });
    },
    batchGenerate: async (data: any) => {
        return apiPost<any>('/recommendations/generate/batch', data);
    },
    accept: async (id: string) => {
        return apiPost<Recommendation>(`/recommendations/${id}/accept`, {});
    },
    reject: async (id: string, reason: string) => {
        return apiPost<Recommendation>(`/recommendations/${id}/reject`, { reason });
    },
    apply: async (id: string) => {
        return apiPost<any>(`/recommendations/${id}/apply`, {});
    }
};
