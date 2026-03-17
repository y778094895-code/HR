// ============================================================
// Alerts Center — Canonical Domain Types (PR-01)
// ============================================================

/** Severity level for an alert */
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/** Lifecycle status of an alert */
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'ACTIONED' | 'CLOSED' | 'ARCHIVED';

/** Classification of what triggered the alert */
export type AlertType =
    | 'ATTRITION_RISK'
    | 'UNDERPERFORMANCE'
    | 'FAIRNESS'
    | 'DATA_QUALITY'
    | 'THRESHOLD_BREACH';

/**
 * Core Alert domain model.
 *
 * Read-state is determined by `readAt`:
 *   - `readAt === null` → unread
 *   - `readAt !== null` → read (ISO timestamp)
 */
export interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    title: string;
    description: string;
    employeeId?: string;
    employeeName?: string;
    department?: string;
    /** Risk probability score, range 0–1 */
    riskScore?: number;
    /** ISO timestamp when the alert was triggered */
    triggeredAt: string;
    /** Model or rule name that generated this alert */
    modelSource?: string;
    /** ISO timestamp when the alert was first read; null = unread */
    readAt: string | null;
    /** ISO timestamp when the alert was resolved; null = unresolved */
    resolvedAt?: string | null;
    assignedToUserId?: string;
    assignedToName?: string;
    escalated?: boolean;
    convertedCaseId?: string;
    /** ML model version that produced this alert */
    mlModelVersion?: string;
    /** Confidence of the ML prediction, range 0–1 */
    confidenceScore?: number;
}

// ── Detail Contract ──

/** A single contributing factor driving an alert */
export interface AlertDriver {
    factor: string;
    /** Impact weight, range 0–1 */
    impact: number;
}

/** Explainability data attached to an alert */
export interface AlertExplanation {
    riskScore?: number;
    drivers?: AlertDriver[];
    thresholdExplanation?: string;
    historicalComparison?: string;
}

/** Recommended action for an alert */
export interface AlertRecommendation {
    intervention: string;
    estimatedImpact: string;
    riskReduction: string;
}

/** Full detail payload for a single alert */
export interface AlertDetails {
    alertId: string;
    summary: Record<string, any>;
    explanation?: AlertExplanation;
    recommendations?: AlertRecommendation;
    relatedCases?: { caseId: string; status: string }[];
    auditTrail: AlertAuditEvent[];
}

// ── Audit Trail ──

/** Actions that can be taken on an alert */
export type AlertAction =
    | 'ACKNOWLEDGE'
    | 'ASSIGN'
    | 'CONVERT_TO_CASE'
    | 'DISMISS'
    | 'ESCALATE'
    | 'CLOSE'
    | 'ARCHIVE'
    | 'MARK_READ';

/** Single entry in the alert audit log */
export interface AlertAuditEvent {
    id: string;
    alertId: string;
    actorUserId: string;
    actorName?: string;
    /** ISO timestamp */
    at: string;
    fromStatus?: AlertStatus;
    toStatus?: AlertStatus;
    action: AlertAction;
    note?: string;
}

// ── Filters ──

/** Filter parameters for alert list queries */
export interface AlertFilters {
    severity?: AlertSeverity | 'ALL';
    type?: AlertType | 'ALL';
    status?: AlertStatus | 'ALL';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    onlyUnread?: boolean;
    sortBy?: 'newest' | 'highestRisk' | 'department';
}

// ── Permissions ──

export type AlertViewScope = 'all' | 'aggregate' | 'department' | 'team' | 'data_quality_only';

/** Role-based permissions controlling alert operations */
export interface AlertPermissions {
    canView: boolean;
    viewScope: AlertViewScope;
    canConvert: boolean;
    canDismiss: boolean;
    canEscalate: boolean;
    canAcknowledge: boolean;
    canAssign: boolean;
}
