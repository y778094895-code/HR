import { useInterventionsStore } from '../business/interventions.store';
import { createSelector } from 'reselect';

export const useAllInterventions = () => useInterventionsStore((state) => state.interventions);
export const useInterventionsLoading = () => useInterventionsStore((state) => state.loading);
export const useInterventionsError = () => useInterventionsStore((state) => state.error);

const selectInterventions = (state: any) => state.interventions;

export const selectPendingInterventions = createSelector(
    [selectInterventions],
    (interventions) => interventions.filter((i: any) => i.status === 'pending')
);
