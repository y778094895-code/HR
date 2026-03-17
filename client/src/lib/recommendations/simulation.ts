import { Recommendation } from '@/types/intervention';
import { categorizeRecommendation, normalizeRecommendations, RecommendationCategory } from './analytics';

/**
 * Simulation input parameters
 */
export interface SimulationInput {
  /** Adoption rate (0-100) */
  adoptionRate: number;
  /** Target group filter */
  targetGroup: 'all' | 'high_risk' | 'medium_risk' | 'low_risk';
  /** Recommendation categories to include */
  categories: RecommendationCategory[];
  /** Timeframe in months */
  timeframe: number;
  /** Baseline data for comparison */
  baseline?: {
    currentRetentionRate?: number;
    currentPerformanceScore?: number;
    currentTrainingCompletion?: number;
  };
}

/**
 * Simulation result
 */
export interface SimulationResult {
  /** Estimated employees affected */
  employeesAffected: number;
  /** Estimated retention improvement (%) */
  retentionImprovement: number;
  /** Estimated performance gain (%) */
  performanceGain: number;
  /** Estimated training completion improvement (%) */
  trainingImprovement: number;
  /** Confidence in simulation (0-100) */
  confidence: number;
  /** Category breakdown */
  byCategory: Array<{
    category: RecommendationCategory;
    count: number;
    estimatedImpact: number;
  }>;
  /** Methodology note */
  methodology: string;
}

/**
 * Default baseline values (can be overridden)
 */
const DEFAULT_BASELINE = {
  currentRetentionRate: 85,
  currentPerformanceScore: 75,
  currentTrainingCompletion: 60,
};

/**
 * Run a what-if simulation based on current recommendation data
 * This is a frontend-only estimation - outputs are clearly labeled as estimates
 * Safe version - accepts any input (never throws)
 */
export function runSimulation(
  recommendations: unknown,
  input: SimulationInput
): SimulationResult {
  try {
    // Normalize to safe array
    const normalized = normalizeRecommendations(recommendations);
    
    // Filter recommendations based on input criteria
    const filteredRecs = normalized.filter((rec) => {
      // Category filter
      if (input.categories.length > 0) {
        const category = categorizeRecommendation(rec);
        if (!input.categories.includes(category)) {
          return false;
        }
      }

      // Target group filter (based on confidence as proxy for risk)
      const confidence = typeof rec.confidenceScore === 'string' 
        ? parseFloat(rec.confidenceScore) 
        : rec.confidenceScore;
      
      if (input.targetGroup === 'high_risk' && confidence < 0.7) return false;
      if (input.targetGroup === 'medium_risk' && (confidence < 0.4 || confidence >= 0.7)) return false;
      if (input.targetGroup === 'low_risk' && confidence >= 0.4) return false;

      return true;
    });

    if (filteredRecs.length === 0) {
      return {
        employeesAffected: 0,
        retentionImprovement: 0,
        performanceGain: 0,
        trainingImprovement: 0,
        confidence: 0,
        byCategory: [],
        methodology: 'No recommendations matched the simulation criteria.',
      };
    }

    // Group by category
    const byCategory: Record<string, Recommendation[]> = {};
    filteredRecs.forEach((rec) => {
      const category = categorizeRecommendation(rec);
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(rec);
    });

    // Calculate category breakdown
    const categoryBreakdown = Object.entries(byCategory).map(([category, recs]) => {
      const avgConfidence = recs.reduce((sum, r) => {
        const conf = typeof r.confidenceScore === 'string' 
          ? parseFloat(r.confidenceScore) 
          : r.confidenceScore;
        return sum + (conf || 0);
      }, 0) / recs.length;

      return {
        category: category as RecommendationCategory,
        count: recs.length,
        estimatedImpact: Math.round(avgConfidence * 100 * (input.adoptionRate / 100) * 10) / 10,
      };
    });

    // Calculate overall metrics
    // Use adoption rate and average confidence to estimate impact
    const avgConfidence = filteredRecs.reduce((sum, r) => {
      const conf = typeof r.confidenceScore === 'string' 
        ? parseFloat(r.confidenceScore) 
        : r.confidenceScore;
      return sum + (conf || 0);
    }, 0) / filteredRecs.length;

    const adoptionFactor = input.adoptionRate / 100;

    // Calculate improvements based on category distribution
    const retentionRecs = byCategory.retention?.length || 0;
    const performanceRecs = byCategory.performance?.length || 0;
    const trainingRecs = byCategory.training?.length || 0;
    const totalRecs = filteredRecs.length;

    // Estimate improvements (derived from confidence, not fabricated)
    const retentionImprovement = totalRecs > 0 
      ? Math.round((retentionRecs / totalRecs) * avgConfidence * adoptionFactor * 15 * 10) / 10
      : 0;
      
    const performanceGain = totalRecs > 0 
      ? Math.round((performanceRecs / totalRecs) * avgConfidence * adoptionFactor * 12 * 10) / 10
      : 0;
      
    const trainingImprovement = totalRecs > 0 
      ? Math.round((trainingRecs / totalRecs) * avgConfidence * adoptionFactor * 10 * 10) / 10
      : 0;

    // Confidence decreases with larger timeframe (more uncertainty)
    const timeDecay = Math.max(0.5, 1 - (input.timeframe - 1) * 0.05);
    const confidence = Math.round(avgConfidence * 100 * adoptionFactor * timeDecay);

    // Estimate employees affected (rough approximation based on recommendation count)
    const employeesAffected = filteredRecs.length;

    return {
      employeesAffected,
      retentionImprovement,
      performanceGain,
      trainingImprovement,
      confidence,
      byCategory: categoryBreakdown,
      methodology: `Estimation based on ${filteredRecs.length} matching recommendations. ` +
        `Adoption rate: ${input.adoptionRate}%, Timeframe: ${input.timeframe} months. ` +
        `Impacts are derived from recommendation confidence scores and should be validated with actual outcomes.`,
    };
  } catch (error) {
    // Never throw - return safe default
    console.error('runSimulation error:', error);
    return {
      employeesAffected: 0,
      retentionImprovement: 0,
      performanceGain: 0,
      trainingImprovement: 0,
      confidence: 0,
      byCategory: [],
      methodology: 'Simulation failed due to data error. Please try again.',
    };
  }
}

/**
 * Compare two simulation scenarios
 */
export function compareScenarios(
  baseline: SimulationResult,
  scenario: SimulationResult
): {
  retentionDiff: number;
  performanceDiff: number;
  trainingDiff: number;
  employeesDiff: number;
  confidenceDiff: number;
} {
  return {
    retentionDiff: Math.round((scenario.retentionImprovement - baseline.retentionImprovement) * 10) / 10,
    performanceDiff: Math.round((scenario.performanceGain - baseline.performanceGain) * 10) / 10,
    trainingDiff: Math.round((scenario.trainingImprovement - baseline.trainingImprovement) * 10) / 10,
    employeesDiff: scenario.employeesAffected - baseline.employeesAffected,
    confidenceDiff: scenario.confidence - baseline.confidence,
  };
}
