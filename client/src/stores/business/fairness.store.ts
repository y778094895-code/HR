import { createStore } from '../base/base.store';
import { fairnessService } from '@/services/resources/fairness.service';
import { BiasMetric } from '@/services/resources/types';

interface FairnessState {
    metrics: BiasMetric[];
    analysis: any; // Define a more specific type if available
    loading: boolean;
    error: string | null;
}

const initialState: FairnessState = {
    metrics: [],
    analysis: null,
    loading: false,
    error: null,
};

export const useFairnessStore = createStore<FairnessState, any>(
    {
        name: 'fairness',
        initial: initialState,
        persist: false,
    },
    (set, get) => ({
        set: (data: Partial<FairnessState>) => set(data),
        reset: () => set(initialState),

        fetchFairnessData: async () => {
            set({ loading: true, error: null });
            try {
                const [metrics, analysis] = await Promise.all([
                    fairnessService.getBiasMetrics(),
                    fairnessService.getFairnessAnalysis()
                ]);

                set({
                    metrics,
                    analysis,
                    loading: false,
                });
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to fetch fairness data',
                    loading: false,
                });
            }
        },
    })
);
