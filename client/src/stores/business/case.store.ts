import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost } from '../../lib/api';

export type CaseStatus = 'open' | 'in_progress' | 'under_review' | 'closed';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface CaseIntervention {
    id: string;
    title: string;
    description: string;
    date: string;
    type: string;
}

export interface CaseTimelineEvent {
    id: string;
    date: string;
    description: string;
    user: string;
}

export interface HRCase {
    id: string;
    title: string;
    description: string;
    status: CaseStatus;
    priority: CasePriority;
    createdAt: string;
    updatedAt: string;
    ownerId?: string;
    ownerName?: string;
    employeeId?: string;
    employeeName?: string;
    sourceAlertId?: string;
    interventions: CaseIntervention[];
    timeline: CaseTimelineEvent[];
}

export interface CaseStore {
    cases: HRCase[];
    isLoading: boolean;
    error: string | null;
    fetchCases: () => Promise<void>;
    addCase: (caseData: Omit<HRCase, 'id' | 'createdAt' | 'updatedAt' | 'interventions' | 'timeline' | 'status'>) => Promise<void>;
    updateCaseStatus: (id: string, status: CaseStatus) => Promise<void>;
    addIntervention: (caseId: string, intervention: Omit<CaseIntervention, 'id' | 'date'>) => Promise<void>;
}

export const useCaseStore = create<CaseStore>()(
    persist(
        (set, get) => ({
            cases: [],
            isLoading: false,
            error: null,
            fetchCases: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiGet<HRCase[]>('/cases');
                    set({ cases: response, isLoading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch cases', isLoading: false });
                }
            },
            addCase: async (caseData) => {
                const newCase: HRCase = {
                    ...caseData,
                    id: 'CASE-' + Math.floor(Math.random() * 100000),
                    status: 'open',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    interventions: [],
                    timeline: [{ id: Math.random().toString(), date: new Date().toISOString(), description: 'تم إنشاء الحالة', user: 'المستخدم الحالي' }]
                };

                set((state) => ({ cases: [newCase, ...state.cases] }));
                try {
                    await apiPost('/cases', newCase);
                } catch (e) {
                    console.error('Failed to sync case to API');
                }
            },
            updateCaseStatus: async (id, status) => {
                set((state) => ({
                    cases: state.cases.map(c => c.id === id ? {
                        ...c,
                        status,
                        updatedAt: new Date().toISOString(),
                        timeline: [...c.timeline, { id: Math.random().toString(), date: new Date().toISOString(), description: `تغيرت الحالة إلى ${status}`, user: 'المستخدم الحالي' }]
                    } : c)
                }));
                try {
                    await apiPost(`/cases/${id}/status`, { status });
                } catch (e) {
                    console.error('Failed to update case status via API');
                }
            },
            addIntervention: async (caseId, intervention) => {
                const newIntervention = { ...intervention, id: Math.random().toString(), date: new Date().toISOString() };
                set((state) => ({
                    cases: state.cases.map(c => c.id === caseId ? {
                        ...c,
                        interventions: [...c.interventions, newIntervention],
                        updatedAt: new Date().toISOString(),
                        timeline: [...c.timeline, { id: Math.random().toString(), date: new Date().toISOString(), description: `إضافة تدخل جديد: ${intervention.title}`, user: 'المستخدم الحالي' }]
                    } : c)
                }));
                try {
                    await apiPost(`/cases/${caseId}/interventions`, newIntervention);
                } catch (e) {
                    console.error('Failed to add intervention via API');
                }
            }
        }),
        {
            name: 'smart-hr-cases-storage'
        }
    )
);
