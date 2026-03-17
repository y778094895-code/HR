import { ImpactStats, Intervention } from '@/types/intervention';

/**
 * Time period for comparison
 */
export interface TimePeriod {
  start: string;
  end: string;
  label: string;
}

/**
 * Before/After comparison data
 */
export interface BeforeAfterComparison {
  metric: string;
  before: number;
  after: number;
  change: number;
  changePercentage: number;
  period: TimePeriod;
}

/**
 * Trend analysis data point
 */
export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Intervention outcome metrics
 */
export interface InterventionOutcomeMetrics {
  totalInterventions: number;
  completed: number;
  inProgress: number;
  cancelled: number;
  successRate: number;
  averageCompletionTime: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

/**
 * Department comparison data
 */
export interface DepartmentComparison {
  department: string;
  totalInterventions: number;
  completionRate: number;
  averageImpact: number;
}

/**
 * Aggregate impact metrics for display
 */
export interface AggregateImpactMetrics {
  totalInterventions: number;
  completedInterventions: number;
  successRate: number;
  riskReduction: number;
  retentionStabilization: number;
  trainingImpact: number;
  performanceImprovement: number;
}

/**
 * Normalize any input to a safe array of interventions
 * Handles: array, undefined, null, {items:[...]}, {data:[...]}, {interventions:[...]}
 */
export function normalizeInterventions(input: unknown): Intervention[] {
  if (!input) return [];
  
  // Already an array
  if (Array.isArray(input)) {
    return input.filter((item): item is Intervention => 
      item !== null && item !== undefined && typeof item === 'object'
    );
  }
  
  // Object wrapper - try common keys
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    
    if (Array.isArray(obj.items)) {
      return normalizeInterventions(obj.items);
    }
    if (Array.isArray(obj.data)) {
      return normalizeInterventions(obj.data);
    }
    if (Array.isArray(obj.interventions)) {
      return normalizeInterventions(obj.interventions);
    }
    if (Array.isArray(obj.results)) {
      return normalizeInterventions(obj.results);
    }
  }
  
  // Unknown format - return empty
  return [];
}

/**
 * Normalize ImpactStats to safe object
 */
export function normalizeImpactStats(input: unknown): ImpactStats | null {
  if (!input || typeof input !== 'object') {
    return null;
  }
  
  const stats = input as Record<string, unknown>;
  
  return {
    totalInterventions: typeof stats.totalInterventions === 'number' ? stats.totalInterventions : 0,
    completedCount: typeof stats.completedCount === 'number' ? stats.completedCount : 0,
    successRate: typeof stats.successRate === 'number' ? stats.successRate : 0,
    riskReduction: typeof stats.riskReduction === 'number' ? stats.riskReduction : 0,
    trends: Array.isArray(stats.trends) ? stats.trends as Array<{ date: string; impact: number }> : [],
    outcomes: Array.isArray(stats.outcomes) ? stats.outcomes as Array<{ label: string; value: number; color?: string }> : [],
  };
}

/**
 * Process intervention data to extract outcome metrics - safe version (never throws)
 */
export function processInterventionOutcomes(interventions: unknown): InterventionOutcomeMetrics {
  try {
    const normalized = normalizeInterventions(interventions);
    
    if (normalized.length === 0) {
      return {
        totalInterventions: 0,
        completed: 0,
        inProgress: 0,
        cancelled: 0,
        successRate: 0,
        averageCompletionTime: 0,
        byType: {},
        byStatus: {},
      };
    }

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let completedCount = 0;
    let inProgressCount = 0;
    let cancelledCount = 0;
    let totalCompletionTime = 0;
    let completedWithTime = 0;

    normalized.forEach((intervention) => {
      // Count by status
      const status = (intervention.status || 'unknown').toLowerCase();
      byStatus[status] = (byStatus[status] || 0) + 1;

      if (status === 'completed') {
        completedCount++;
        // Calculate completion time if dates available
        if (intervention.createdAt && intervention.completedAt) {
          const start = new Date(intervention.createdAt).getTime();
          const end = new Date(intervention.completedAt).getTime();
          const days = (end - start) / (1000 * 60 * 60 * 24);
          totalCompletionTime += days;
          completedWithTime++;
        }
      } else if (status === 'in_progress') {
        inProgressCount++;
      } else if (status === 'cancelled') {
        cancelledCount++;
      }

      // Count by type
      const type = intervention.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    const total = normalized.length;
    const successRate = total > 0 ? (completedCount / total) * 100 : 0;
    const averageCompletionTime = completedWithTime > 0 
      ? totalCompletionTime / completedWithTime 
      : 0;

    return {
      totalInterventions: total,
      completed: completedCount,
      inProgress: inProgressCount,
      cancelled: cancelledCount,
      successRate: Math.round(successRate * 10) / 10,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      byType,
      byStatus,
    };
  } catch (error) {
    // Never throw - return safe default
    console.error('processInterventionOutcomes error:', error);
    return {
      totalInterventions: 0,
      completed: 0,
      inProgress: 0,
      cancelled: 0,
      successRate: 0,
      averageCompletionTime: 0,
      byType: {},
      byStatus: {},
    };
  }
}

/**
 * Calculate aggregate impact metrics from ImpactStats - safe version
 */
export function calculateAggregateImpact(stats: unknown): AggregateImpactMetrics {
  const normalized = normalizeImpactStats(stats);
  
  if (!normalized) {
    return {
      totalInterventions: 0,
      completedInterventions: 0,
      successRate: 0,
      riskReduction: 0,
      retentionStabilization: 0,
      trainingImpact: 0,
      performanceImprovement: 0,
    };
  }

  // Derive additional metrics from available data
  const retentionStabilization = normalized.successRate * 0.6;
  const trainingImpact = normalized.successRate * 0.4;
  const performanceImprovement = normalized.successRate * 0.5;

  return {
    totalInterventions: normalized.totalInterventions || 0,
    completedInterventions: normalized.completedCount || 0,
    successRate: normalized.successRate || 0,
    riskReduction: normalized.riskReduction || 0,
    retentionStabilization: Math.round(retentionStabilization * 10) / 10,
    trainingImpact: Math.round(trainingImpact * 10) / 10,
    performanceImprovement: Math.round(performanceImprovement * 10) / 10,
  };
}

/**
 * Generate before/after comparison from trend data - safe version
 */
export function generateBeforeAfterComparison(
  trends: unknown,
  period1: TimePeriod,
  period2: TimePeriod
): BeforeAfterComparison[] {
  // Normalize trends
  let normalizedTrends: Array<{ date: string; impact: number }> = [];
  
  if (Array.isArray(trends)) {
    normalizedTrends = trends.filter((t): t is { date: string; impact: number } => 
      t !== null && t !== undefined && typeof t === 'object' &&
      typeof t.date === 'string' && typeof t.impact === 'number'
    );
  }
  
  if (normalizedTrends.length === 0) {
    return [];
  }

  const parseDate = (d: string) => new Date(d).getTime();
  
  const period1Data = normalizedTrends.filter((t) => {
    const date = parseDate(t.date);
    return date >= parseDate(period1.start) && date <= parseDate(period1.end);
  });

  const period2Data = normalizedTrends.filter((t) => {
    const date = parseDate(t.date);
    return date >= parseDate(period2.start) && date <= parseDate(period2.end);
  });

  const avg1 = period1Data.length > 0
    ? period1Data.reduce((sum, t) => sum + t.impact, 0) / period1Data.length
    : 0;

  const avg2 = period2Data.length > 0
    ? period2Data.reduce((sum, t) => sum + t.impact, 0) / period2Data.length
    : 0;

  const change = avg2 - avg1;
  const changePercentage = avg1 > 0 ? (change / avg1) * 100 : 0;

  return [{
    metric: 'Impact Score',
    before: Math.round(avg1 * 100) / 100,
    after: Math.round(avg2 * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercentage: Math.round(changePercentage * 10) / 10,
    period: period2,
  }];
}

/**
 * Calculate temporal trends from historical data - safe version
 */
export function calculateTrends(trends: unknown): TrendPoint[] {
  let normalizedTrends: Array<{ date: string; impact: number }> = [];
  
  if (Array.isArray(trends)) {
    normalizedTrends = trends.filter((t): t is { date: string; impact: number } => 
      t !== null && t !== undefined && typeof t === 'object' &&
      typeof t.date === 'string' && typeof t.impact === 'number'
    );
  }
  
  if (normalizedTrends.length === 0) {
    return [];
  }

  // Sort by date and return
  return [...normalizedTrends]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => ({
      date: t.date,
      value: t.impact,
      label: new Date(t.date).toLocaleDateString(),
    }));
}

/**
 * Validate time period inputs
 */
export function validateTimePeriod(period: TimePeriod): boolean {
  const start = new Date(period.start);
  const end = new Date(period.end);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
}

/**
 * Create default time periods for comparison
 */
export function createDefaultPeriods(): { before: TimePeriod; after: TimePeriod } {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  return {
    before: {
      start: sixMonthsAgo.toISOString().split('T')[0],
      end: threeMonthsAgo.toISOString().split('T')[0],
      label: '6 months ago - 3 months ago',
    },
    after: {
      start: threeMonthsAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
      label: 'Last 3 months',
    },
  };
}
