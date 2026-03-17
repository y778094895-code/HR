import { useFairnessStore } from '../business/fairness.store';
import { createSelector } from 'reselect';

export const useFairnessMetrics = () => useFairnessStore((state) => state.metrics);
export const useFairnessAnalysis = () => useFairnessStore((state) => state.analysis);
export const useFairnessLoading = () => useFairnessStore((state) => state.loading);
export const useFairnessError = () => useFairnessStore((state) => state.error);

const selectMetrics = (state: any) => state.metrics;

export const selectBiasedMetrics = createSelector(
    [selectMetrics],
    (metrics) => metrics.filter((m: any) => m.is_biased)
);
