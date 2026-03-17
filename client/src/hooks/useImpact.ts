import { useState, useCallback, useMemo } from 'react';
import { interventionService } from '../services/resources/intervention.service';
import { ImpactStats, Intervention } from '../types/intervention';
import {
  calculateAggregateImpact,
  processInterventionOutcomes,
  generateBeforeAfterComparison,
  calculateTrends,
  createDefaultPeriods,
  normalizeImpactStats,
  normalizeInterventions,
  AggregateImpactMetrics,
  InterventionOutcomeMetrics,
  BeforeAfterComparison,
  TrendPoint,
  TimePeriod,
} from '../lib/impact/analytics';

export const useImpact = () => {
  const [overview, setOverview] = useState<ImpactStats | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonPeriods, setComparisonPeriods] = useState(createDefaultPeriods);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interventionService.getAnalytics();
      // Normalize to ensure safe object
      const normalized = normalizeImpactStats(data);
      setOverview(normalized);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch impact overview');
      // Keep existing data on error - graceful degradation
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInterventions = useCallback(async (params?: { status?: 'Draft' | 'Active' | 'Completed' | 'Closed' }) => {
    setLoading(true);
    try {
      const data = await interventionService.getInterventions(params);
      // Normalize to ensure safe array - handle various response shapes
      let interventionsData: unknown = data;
      // Handle PaginatedResponse shape
      if (data && typeof data === 'object' && 'data' in data) {
        interventionsData = (data as { data: unknown }).data;
      }
      const normalized = normalizeInterventions(interventionsData);
      setInterventions(normalized);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch interventions');
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aggregate metrics from ImpactStats - always safe
  const aggregateMetrics: AggregateImpactMetrics = useMemo(() => {
    return calculateAggregateImpact(overview);
  }, [overview]);

  // Outcome metrics from intervention data - always safe
  const outcomeMetrics: InterventionOutcomeMetrics = useMemo(() => {
    return processInterventionOutcomes(interventions);
  }, [interventions]);

  // Trend data from overview - always safe
  const trends: TrendPoint[] = useMemo(() => {
    return calculateTrends(overview?.trends);
  }, [overview]);

  // Before/After comparison - always safe
  const beforeAfterComparison: BeforeAfterComparison[] = useMemo(() => {
    return generateBeforeAfterComparison(
      overview?.trends,
      comparisonPeriods.before,
      comparisonPeriods.after
    );
  }, [overview, comparisonPeriods]);

  // Update comparison periods
  const updateComparisonPeriods = useCallback((before: TimePeriod, after: TimePeriod) => {
    setComparisonPeriods({ before, after });
  }, []);

  // Refresh all impact data
  const refresh = useCallback(async () => {
    await Promise.all([fetchOverview(), fetchInterventions()]);
  }, [fetchOverview, fetchInterventions]);

  return {
    overview,
    interventions,
    loading,
    error,
    fetchOverview,
    fetchInterventions,
    aggregateMetrics,
    outcomeMetrics,
    trends,
    beforeAfterComparison,
    comparisonPeriods,
    updateComparisonPeriods,
    refresh,
  };
};
