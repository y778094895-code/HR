// ============================================================
// Risk Domain — Unified Types (PR-01)
// ============================================================

/**
 * A single contributing factor in a risk prediction.
 * Replaces the previous untyped `any` for contributingFactors.
 */
export interface RiskFactor {
    /** Name of the risk driver */
    factor: string;
    /** Impact weight, range 0–1 (positive = increases risk) */
    impact: number;
    /** Human-readable explanation */
    description?: string;
}

/**
 * Turnover risk prediction for a single employee.
 *
 * All fields use camelCase. The `contributingFactors` field is
 * now properly typed as `RiskFactor[]`.
 */
export interface TurnoverRisk {
    employeeId: string;
    /** Risk probability score, range 0–1 */
    riskScore: number;
    /** Categorical risk level */
    riskLevel: string;
    /** Confidence of the ML prediction, range 0–1 */
    confidenceScore?: number;
    /** Structured list of factors contributing to the risk score */
    contributingFactors: RiskFactor[];
    /** ISO date of when the prediction was generated */
    predictionDate: string;
    /** ISO date until which this prediction is considered valid */
    predictionValidUntil?: string;
    /** Version identifier of the ML model used */
    mlModelVersion?: string;
    /** ISO timestamp of record creation */
    createdAt?: string;
}
