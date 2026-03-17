import { createStore } from '../base/base.store';
import { interventionService } from '@/services/resources/intervention.service';
import { Intervention } from '@/services/resources/types';

interface InterventionState {
    interventions: Intervention[];
    loading: boolean;
    error: string | null;
}

const initialState: InterventionState = {
    interventions: [],
    loading: false,
    error: null,
};

export const useInterventionsStore = createStore<InterventionState, any>(
    {
        name: 'interventions',
        initial: initialState,
        persist: false,
    },
    (set, get) => ({
        set: (data: Partial<InterventionState>) => set(data),
        reset: () => set(initialState),

        fetchInterventions: async () => {
            set({ loading: true, error: null });
            try {
                const data = await interventionService.getInterventions();
                set({
                    interventions: data,
                    loading: false,
                });
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to fetch interventions',
                    loading: false,
                });
            }
        },

        createIntervention: async (data: Partial<Intervention>) => {
            set({ loading: true, error: null });
            try {
                await interventionService.createIntervention(data);
                await get().fetchInterventions();
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to create intervention',
                    loading: false,
                });
                throw error;
            }
        },
    })
);
