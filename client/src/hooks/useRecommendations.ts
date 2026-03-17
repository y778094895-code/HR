import { useState, useCallback, useMemo } from 'react';
import { interventionService } from '../services/resources/intervention.service';
import { Recommendation } from '../types/intervention';
import {
  filterRecommendations,
  deriveAnalytics,
  calculateUplift,
  normalizeRecommendations,
  RecommendationFilters,
  RecommendationAnalytics,
  UpliftEstimate,
} from '../lib/recommendations/analytics';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({});

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interventionService.getRecommendations();
      // Normalize to ensure it's always a safe array
      const normalized = normalizeRecommendations(data);
      setRecommendations(normalized);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations');
      // Keep empty state on error
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyRecommendation = async (id: string) => {
    try {
      await interventionService.handleRecommendationAction(id, 'apply');
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'applied' as const } : r))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to apply recommendation');
      throw err;
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'apply') => {
    try {
      await interventionService.handleRecommendationAction(id, action);
      if (action === 'apply') {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'applied' as const } : r))
        );
      } else if (action === 'accept') {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'accepted' as const } : r))
        );
      } else if (action === 'reject') {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
        );
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} recommendation`);
      throw err;
    }
  };

  // Filtered recommendations based on current filters - always safe
  const filteredRecommendations = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return recommendations;
    }
    return filterRecommendations(recommendations, filters);
  }, [recommendations, filters]);

  // Analytics derived from real data - always safe
  const analytics: RecommendationAnalytics = useMemo(() => {
    return deriveAnalytics(recommendations);
  }, [recommendations]);

  // Uplift estimates from active recommendations - always safe
  const upliftEstimates: UpliftEstimate[] = useMemo(() => {
    return calculateUplift(recommendations);
  }, [recommendations]);

  // Update filters
  const updateFilters = useCallback((newFilters: RecommendationFilters) => {
    setFilters(newFilters);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh after action (to get updated impact data)
  const refresh = useCallback(async () => {
    await fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations: filteredRecommendations,
    allRecommendations: recommendations,
    loading,
    error,
    fetchRecommendations,
    applyRecommendation,
    handleAction,
    filters,
    updateFilters,
    clearFilters,
    analytics,
    upliftEstimates,
    refresh,
  };
};
