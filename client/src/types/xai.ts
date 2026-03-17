// ============================================================
// XAI (Explainability) Domain — Unified Types (PR-01)
// ============================================================

/** A single driver/factor in an ML explanation */
export interface ExplainabilityDriver {
    /** Name of the contributing factor */
    factor: string;
    /** Impact weight, range 0–1 (positive = increases prediction) */
    impact: number;
    /** Human-readable explanation of this factor's contribution */
    description?: string;
}

/** Feature importance entry from ML model output */
export interface FeatureImportance {
    /** Name of the input feature */
    featureName: string;
    /** Importance weight (SHAP value or similar), range 0–1 */
    importance: number;
    /** Direction of the feature's influence on the prediction */
    direction: 'positive' | 'negative';
}

/**
 * Explainability record for an ML prediction.
 *
 * Replaces the previous placeholder shape. The old `explanationJson: any`
 * field is kept as a deprecated compatibility alias.
 */
export interface ExplainabilityRecord {
    id: string;
    /** Type of entity this explanation relates to (e.g. 'employee', 'department') */
    entityType: string;
    /** ID of the related entity */
    entityId: string;
    /** Structured drivers explaining the prediction */
    drivers: ExplainabilityDriver[];
    /** Optional feature-level importances from the ML model */
    featureImportances?: FeatureImportance[];
    /** Human-readable summary of the explanation */
    summary?: string;
    /** Version of the ML model that produced this explanation */
    mlModelVersion?: string;
    /** Confidence of the prediction, range 0–1 */
    confidenceScore?: number;
    /** ISO timestamp of record creation */
    createdAt: string;
    /**
     * @deprecated Use `drivers` and `featureImportances` instead.
     * Raw JSON kept for transitional compatibility.
     */
    explanationJson?: any;
}
