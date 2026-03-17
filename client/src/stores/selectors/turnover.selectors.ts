import { useTurnoverStore } from '../business/turnover.store';
import { createSelector } from 'reselect';
import { TurnoverRisk } from '../../types/risk';

interface TurnoverStoreState {
    risks: TurnoverRisk[];
    prediction: any;
    loading: boolean;
    error: string | null;
}

export const useTurnoverRisks = () => useTurnoverStore((state) => state.risks);
export const useTurnoverPrediction = () => useTurnoverStore((state) => state.prediction);
export const useTurnoverLoading = () => useTurnoverStore((state) => state.loading);
export const useTurnoverError = () => useTurnoverStore((state) => state.error);

const selectRisks = (state: TurnoverStoreState) => state.risks;

export const selectHighRiskEmployees = createSelector(
    [selectRisks],
    (risks) => risks.filter((r: TurnoverRisk) => r.riskScore > 0.7) // Normalized riskScore (0-1)
);
