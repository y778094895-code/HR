import { Recommendation } from '@/types/intervention';

/**
 * Recommendation type categories derived from available data
 */
export type RecommendationCategory = 'retention' | 'performance' | 'training' | 'fairness' | 'general';

/**
 * Recommendation priority based on confidence score
 */
export type RecommendationPriority = 'high' | 'medium' | 'low';

/**
 * Filter options for recommendations
 */
export interface RecommendationFilters {
  status?: Recommendation['status'][];
  category?: RecommendationCategory[];
  priority?: RecommendationPriority[];
  source?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Aggregated analytics derived from real recommendation data
 */
export interface RecommendationAnalytics {
  totalCount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  bySource: Record<string, number>;
  averageConfidence: number;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  priorityDistribution: Array<{ priority: string; count: number; percentage: number }>;
}

/**
 * Uplift estimate based on recommendation data (derived from real fields)
 */
export interface UpliftEstimate {
  category: RecommendationCategory;
  potentialCount: number;
  confidence: number;
  estimatedImpact: number;
}

/**
 * Check if a string is valid human-readable text (not corrupted/gibberish)
 * Returns false for strings that are:
 * - Empty or whitespace only
 * - Made mostly of ? characters
 * - Contain replacement characters (�)
 * - Non-printable or control characters
 * - Gibberish/invalid encoding
 */
function isValidReadableText(value: unknown): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  const str = value.trim();
  
  if (str.length === 0) {
    return false;
  }
  
  // Check for replacement character (�) which indicates encoding issues
  if (str.includes('�') || str.includes('\uFFFD')) {
    return false;
  }
  
  // Check if string is made mostly of question marks (common corruption pattern)
  const questionMarkCount = (str.match(/\?/g) || []).length;
  if (questionMarkCount > str.length * 0.5) {
    return false;
  }
  
  // Check for other common invalid characters that indicate corruption
  // Unicode replacement char, non-printable control chars, etc.
  const invalidPattern = /[\u0000-\u001F\u007F-\u009F\uD800-\uDFFF]/;
  if (invalidPattern.test(str)) {
    // Allow some common control chars like tab, newline in content
    const printableCheck = str.replace(/[\t\n\r]/g, '');
    if (printableCheck.length === 0 || invalidPattern.test(printableCheck)) {
      return false;
    }
  }
  
  // Check if string is mostly non-Latin special symbols (common encoding issue)
  const latinCharCount = (str.match(/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/g) || []).length;
  const digitCount = (str.match(/[0-9]/g) || []).length;
  const usefulCharCount = latinCharCount + digitCount;
  
  // If less than 30% are useful characters, consider it corrupted
  if (usefulCharCount > 0 && usefulCharCount / str.length < 0.3) {
    return false;
  }
  
  return true;
}

/**
 * Safely get a string value with proper fallbacks for corrupted/malformed text
 * This ensures no broken/gibberish/???? text appears in the UI
 */
export function sanitizeText(value: unknown, fallback: string): string {
  if (isValidReadableText(value)) {
    return String(value).trim();
  }
  return fallback;
}

/**
 * Normalize any input to a safe array of recommendations
 * Handles: array, undefined, null, {items:[...]}, {data:[...]}, {recommendations:[...]}
 */
export function normalizeRecommendations(input: unknown): Recommendation[] {
  if (!input) return [];
  
  // Already an array
  if (Array.isArray(input)) {
    return input.filter((item): item is Recommendation => 
      item !== null && item !== undefined && typeof item === 'object'
    );
  }
  
  // Object wrapper - try common keys
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    
    if (Array.isArray(obj.items)) {
      return normalizeRecommendations(obj.items);
    }
    if (Array.isArray(obj.data)) {
      return normalizeRecommendations(obj.data);
    }
    if (Array.isArray(obj.recommendations)) {
      return normalizeRecommendations(obj.recommendations);
    }
    if (Array.isArray(obj.results)) {
      return normalizeRecommendations(obj.results);
    }
  }
  
  // Unknown format - return empty
  return [];
}

/**
 * Categorize recommendation based on type
 */
export function categorizeRecommendation(rec: Recommendation): RecommendationCategory {
  const type = (rec.recommendationType || rec.suggestedInterventionType || '').toLowerCase();
  
  if (type.includes('retention') || type.includes('risk') || type.includes('attrition')) {
    return 'retention';
  }
  if (type.includes('performance') || type.includes('productivity')) {
    return 'performance';
  }
  if (type.includes('training') || type.includes('learning') || type.includes('development')) {
    return 'training';
  }
  if (type.includes('fairness') || type.includes('bias') || type.includes('equity')) {
    return 'fairness';
  }
  return 'general';
}

/**
 * Determine priority based on confidence score
 */
export function getPriority(confidenceScore: number | string): RecommendationPriority {
  const num = typeof confidenceScore === 'string' ? parseFloat(confidenceScore) : confidenceScore;
  if (num >= 0.8) return 'high';
  if (num >= 0.5) return 'medium';
  return 'low';
}

/**
 * Filter recommendations based on criteria - safe version
 */
export function filterRecommendations(
  recommendations: unknown,
  filters: RecommendationFilters
): Recommendation[] {
  const normalized = normalizeRecommendations(recommendations);
  
  return normalized.filter((rec) => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(rec.status)) {
      return false;
    }

    // Category filter
    if (filters.category?.length) {
      const category = categorizeRecommendation(rec);
      if (!filters.category.includes(category)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority?.length) {
      const priority = getPriority(rec.confidenceScore);
      if (!filters.priority.includes(priority)) {
        return false;
      }
    }

    // Source filter
    if (filters.source?.length) {
      const source = (rec.source || 'ml').toLowerCase();
      if (!filters.source.includes(source)) {
        return false;
      }
    }

    // Date range filter (optional, check if createdAt exists)
    if (filters.dateRange && 'createdAt' in rec) {
      const createdAt = (rec as any).createdAt ? new Date((rec as any).createdAt).getTime() : 0;
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      if (createdAt < start || createdAt > end) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Derive analytics from real recommendation data - safe version (never throws)
 */
export function deriveAnalytics(recommendations: unknown): RecommendationAnalytics {
  try {
    const normalized = normalizeRecommendations(recommendations);
    
    if (normalized.length === 0) {
      return {
        totalCount: 0,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        bySource: {},
        averageConfidence: 0,
        statusDistribution: [],
        priorityDistribution: [],
      };
    }

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalConfidence = 0;

    normalized.forEach((rec) => {
      // Count by status
      byStatus[rec.status] = (byStatus[rec.status] || 0) + 1;

      // Count by category
      const category = categorizeRecommendation(rec);
      byCategory[category] = (byCategory[category] || 0) + 1;

      // Count by priority
      const priority = getPriority(rec.confidenceScore);
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      // Count by source
      const source = (rec.source || 'ml').toLowerCase();
      bySource[source] = (bySource[source] || 0) + 1;

      // Sum confidence for average
      const conf = typeof rec.confidenceScore === 'string' ? parseFloat(rec.confidenceScore) : rec.confidenceScore;
      totalConfidence += conf || 0;
    });

    // Calculate distributions
    const totalCount = normalized.length;
    const statusDistribution = Object.entries(byStatus).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalCount) * 100),
    }));

    const priorityDistribution = Object.entries(byPriority).map(([priority, count]) => ({
      priority,
      count,
      percentage: Math.round((count / totalCount) * 100),
    }));

    return {
      totalCount,
      byStatus,
      byCategory,
      byPriority,
      bySource,
      averageConfidence: totalConfidence / totalCount,
      statusDistribution,
      priorityDistribution,
    };
  } catch (error) {
    // Never throw - return safe default
    console.error('deriveAnalytics error:', error);
    return {
      totalCount: 0,
      byStatus: {},
      byCategory: {},
      byPriority: {},
      bySource: {},
      averageConfidence: 0,
      statusDistribution: [],
      priorityDistribution: [],
    };
  }
}

/**
 * Calculate estimated uplift based on active recommendations - safe version
 * Only returns meaningful uplift data (non-zero potential and impact)
 */
export function calculateUplift(recommendations: unknown): UpliftEstimate[] {
  const normalized = normalizeRecommendations(recommendations);
  
  const activeRecs = normalized.filter((r) => r.status === 'active' || r.status === 'accepted');
  
  if (activeRecs.length === 0) {
    return [];
  }

  // Group by category
  const byCategory: Record<string, Recommendation[]> = {};
  activeRecs.forEach((rec) => {
    const category = categorizeRecommendation(rec);
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(rec);
  });

  // Calculate uplift for each category - only include if meaningful
  return Object.entries(byCategory)
    .map(([category, recs]) => {
      const avgConfidence = recs.reduce((sum, r) => {
        const conf = typeof r.confidenceScore === 'string' ? parseFloat(r.confidenceScore) : r.confidenceScore;
        return sum + (conf || 0);
      }, 0) / recs.length;

      // Estimate impact based on confidence
      const estimatedImpact = avgConfidence * 100;
      const potentialCount = recs.length;

      return {
        category: category as RecommendationCategory,
        potentialCount,
        confidence: avgConfidence,
        estimatedImpact: Math.round(estimatedImpact * 10) / 10,
      };
    })
    // Filter out entries with no meaningful data - require both potential AND impact
    .filter(uplift => uplift.potentialCount > 0 && uplift.estimatedImpact > 0);
}
