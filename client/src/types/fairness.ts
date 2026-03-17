// ============================================================
// Fairness Domain — Unified Types (PR-01)
// ============================================================

/** A single bias/fairness metric measurement */
export interface BiasMetric {
    category: string;
    metricName: string;
    /** Measured value of the metric */
    value: number;
    /** Status label (e.g. 'fair', 'flagged', 'needs_review') */
    status: string;
    /** ISO date of analysis */
    analysisDate?: string;
    /** Threshold above/below which the metric is flagged */
    threshold?: number;
    /** Confidence of the measurement, range 0–1 */
    confidenceScore?: number;
}

/** Comparison of a demographic dimension across subgroups */
export interface DemographicComparison {
    /** Demographic dimension (e.g. 'Gender', 'Ethnicity') */
    group: string;
    subgroups: {
        name: string;
        /** Performance or fairness score */
        score: number;
        count: number;
        avgSalary?: number;
        promotionRate?: number;
    }[];
    /** Disparity index, range 0–1 where 0 = perfect equality */
    disparityScore: number;
}

/** Recommended corrective action for a fairness concern */
export interface FairnessRecommendation {
    id: string;
    type: 'hiring' | 'compensation' | 'promotion';
    description: string;
    impact: 'high' | 'medium' | 'low';
    /** Detailed corrective action plan */
    actionPlan: string;
}

/** Aggregate fairness report combining metrics, comparisons, and recommendations */
export interface FairnessReport {
    metrics: BiasMetric[];
    comparisons: DemographicComparison[];
    recommendations: FairnessRecommendation[];
    /** ISO timestamp when this report was generated */
    generatedAt: string;
}
