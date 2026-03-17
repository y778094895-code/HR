import { createStore } from '../base/base.store';
import { turnoverService } from '../../services/resources/turnover.service';
import { TurnoverRisk } from '../../types/risk';

interface TurnoverState {
    risks: TurnoverRisk[];
    prediction: any;
    loading: boolean;
    error: string | null;
}

const initialState: TurnoverState = {
    risks: [],
    prediction: null,
    loading: false,
    error: null,
};

export const useTurnoverStore = createStore<TurnoverState, any>(
    {
        name: 'turnover',
        initial: initialState,
        persist: false,
    },
    (set, get) => ({
        set: (data: Partial<TurnoverState>) => set(data),
        reset: () => set(initialState),

        fetchTurnoverData: async () => {
            set({ loading: true, error: null });
            try {
                const [risksResponse, prediction] = await Promise.all([
                    turnoverService.getTurnoverRisks(),
                    turnoverService.getTurnoverPrediction('all')
                ]);

                // Handle PaginatedResponse if turnoverService returns it
                const risks = Array.isArray(risksResponse) ? risksResponse : (risksResponse as any).items || [];

                set({
                    risks,
                    prediction,
                    loading: false,
                });
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to fetch turnover data',
                    loading: false,
                });
            }
        },
    })
);
