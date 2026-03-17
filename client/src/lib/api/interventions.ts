import { apiGet, apiPost } from '../api';

export interface Intervention {
    id: string;
    employeeId: string;
    type: string;
    title: string;
    description?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    ownerId?: string;
    rationale?: any;
    actionPlan?: any;
    expectedOutcome?: any;
    actualOutcome?: any;
    dueDate?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
}

export const interventionsApi = {
    findAll: async (params?: any) => {
        // Construct query string manually if apiGet doesn't handle it
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiGet<{ items: Intervention[], total: number }>(`/interventions${query}`);
    },
    findOne: async (id: string) => {
        return apiGet<Intervention>(`/interventions/${id}`);
    },
    create: async (data: any) => {
        return apiPost<Intervention>('/interventions', data);
    },
    update: async (id: string, data: any) => {
        // api.ts doesn't have apiPatch, I'll use apiPost with method option if it supports it
        // Or I'll just use fetch directly or add apiPatch to api.ts
        return apiPost<Intervention>(`/interventions/${id}`, data, { method: 'PATCH' } as any);
    },
    assign: async (id: string, ownerId: string) => {
        return apiPost<Intervention>(`/interventions/${id}/assign`, { ownerId });
    },
    close: async (id: string, actualOutcome: any) => {
        return apiPost<Intervention>(`/interventions/${id}/close`, { actualOutcome });
    },
    getHistory: async (id: string) => {
        return apiGet<any[]>(`/interventions/${id}/history`);
    }
};
