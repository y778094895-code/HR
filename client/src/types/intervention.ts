// ============================================================
// Intervention Domain — Unified Types (PR-01)
// ============================================================

/** Status lifecycle of an intervention */
export type InterventionStatus =
    | 'planned'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'overdue';

/** Expected measurable outcome for an intervention */
export interface InterventionOutcome {
    /** Name of the metric being targeted */
    metric: string;
    /** Target value to achieve */
    targetValue: number;
    /** Baseline value before intervention */
    baselineValue?: number;
}

/** An intervention action linked to an employee */
export interface Intervention {
    id: string;
    employeeId: string;
    /** Type/category of the intervention */
    type: string;
    /** Current lifecycle status */
    status: InterventionStatus | string;
    /** ISO date by which the intervention should be completed */
    dueDate: string;
    priority?: 'high' | 'medium' | 'low' | 'HIGH' | 'MEDIUM' | 'LOW';
    description?: string;
    /** ISO timestamp of creation */
    createdAt?: string;
    /** ISO timestamp of completion */
    completedAt?: string;
    /** User ID of the person responsible for this intervention */
    assignedTo?: string;
    /** Alert that triggered this intervention */
    linkedAlertId?: string;
    /** Structured expected outcome replacing the old untyped field */
    expectedOutcome?: InterventionOutcome;
}

/** Unified Recommendation type (PR-04) */
export interface Recommendation {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    /** Categorical type of recommendation */
    recommendationType?: string;
    /** Normalized confidence score (0-1) */
    confidenceScore: number | string;
    /** Current status of the recommendation */
    status: 'active' | 'accepted' | 'rejected' | 'applied' | 'planned' | string;
    /** Source system or model */
    source?: string;
    /** Suggested category of intervention */
    suggestedInterventionType?: string;
    /** Impact metrics associated with this recommendation */
    impact?: Record<string, number>;
    /** Factors contributing to this recommendation */
    contributingFactors?: any[];
    /** Suggested action plan */
    actionPlan?: string[];
    /** ML Model version if applicable */
    mlModelVersion?: string;
    /** Raw logic or explanation */
    logic?: string;
}

/** Unified Impact Statistics type (PR-04) */
export interface ImpactStats {
    totalInterventions: number;
    completedCount: number;
    successRate: number;
    /** Estimated aggregate risk reduction */
    riskReduction?: number;
    /** Historical trends if applicable */
    trends?: Array<{ date: string; impact: number }>;
    /** Distribution of successful outcomes */
    outcomes?: Array<{ label: string; value: number; color?: string }>;
}
