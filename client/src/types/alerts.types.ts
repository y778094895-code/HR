// ============================================================
// Alerts Center — Extended Types (PR-10 Final)
//
// CANONICAL DOMAIN TYPES live in './alerts'.
// This file provides extended transport/UI types (SLA, Channel, Case, etc.)
// for the Unified Alerts features.
// ============================================================

// Re-export canonical types so existing imports from this module keep working
export type {
    AlertSeverity,
    AlertStatus as CanonicalAlertStatus,
    AlertType,
    Alert as CanonicalAlert,
    AlertDriver,
    AlertExplanation,
    AlertRecommendation,
    AlertDetails,
    AlertAction,
    AlertAuditEvent,
    AlertFilters,
    AlertViewScope,
    AlertPermissions,
} from './alerts';

import type { AlertSeverity } from './alerts';

// ---- Extended enums ----

/** @deprecated Prefer AlertSeverity from './alerts'. */
export type Severity = AlertSeverity;

/**
 * Extended alert status including UI-specific states.
 * Canonical statuses are in './alerts'.
 */
export type AlertStatus = 'NEW' | 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'ACTIONED' | 'CLOSED' | 'ARCHIVED';

export type Channel = 'SYSTEM' | 'EMAIL' | 'SMS' | 'PUSH' | 'WEB';

// ---- Extended interfaces ----

/** SLA tracking for real-time alert monitoring */
export interface SLA {
    limitMinutes: number;
    breached: boolean;
    timeRemainingMs: number;
    escalationLevel: number;
}

/** XAI driver with a description field (UI-facing) */
export interface XAIDriver {
    factor: string;
    /** Positive value = increases risk */
    impact: number;
    description: string;
}

/**
 * Extended Alert shape used by legacy UI components.
 *
 * New components should import `Alert` from `./alerts` instead.
 */
export interface Alert {
    id: string;
    title: string;
    subtitle: string;
    severity: Severity;
    status: AlertStatus;
    channel: Channel;
    recipientUserId?: string;
    escalationLevel?: string;
    /** ISO timestamp — maps to createdAt in DB */
    triggeredAt?: string;
    sentAt?: string;
    /** ISO timestamp when first read; null = unread */
    readAt?: string | null;
    /** ISO timestamp when resolved; null = unresolved */
    resolvedAt?: string | null;
    relatedEntityType?: string;
    relatedEntityId?: string;
    sla: SLA;
    xaiDrivers: XAIDriver[];
    suggestedActions: string[];
    ownerId?: string;
    department?: string;
    employeeId?: string;

    // --- UI Component Extensions ---
    summary?: string;
    riskScore?: number;
    escalated?: boolean;
    assignedTo?: { id?: string; name: string };
    type?: string;
    source?: string;
    slaDueAt?: string;
    drivers?: { name: string; impact: string; value: string | number }[];
    suggestions?: { id: string; label: string }[];
    linkedCases?: { id: string; ref: string }[];
    auditTrail?: { id: string; time: string; action: string; actor: { name: string }; channel?: string; fromStatus?: string; toStatus?: string; note?: string }[];
    /** ML model version that produced this alert */
    mlModelVersion?: string;
    /** Confidence of the ML prediction, range 0–1 */
    confidenceScore?: number;
}

/** HR case opened from an alert */
export interface Case {
    id: string;
    alertId: string;
    assignedTo: string;
    hrPlaybookId: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    createdAt: string;
    notes: string[];
}

/** Audit event record */
export interface AuditEvent {
    id: string;
    time: string;
    alertId: string;
    actor: string;
    action: string;
    fromStatus: AlertStatus;
    toStatus: AlertStatus;
    channel: Channel;
    note: string;
}
