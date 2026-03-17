import type {
    Alert as AlertRow,
    AlertDriver as AlertDriverRow,
    AlertRecommendation as AlertRecommendationRow,
    AlertAuditTrail as AlertAuditTrailRow,
    AlertLinkedCase as AlertLinkedCaseRow,
} from '../../data/models/alerts-reports.schema';

export type AlertSeverityDto = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatusDto = 'NEW' | 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'ACTIONED' | 'CLOSED' | 'ARCHIVED';

export interface AlertDto {
    id: string;
    type: string;
    severity: AlertSeverityDto;
    status: AlertStatusDto;
    title: string;
    description: string;
    triggeredAt: string;
    isRead: boolean;
    channel?: string;
    modelSource?: string;
}

export interface AlertAuditEventDto {
    id: string;
    alertId: string;
    actorUserId: string;
    at: string;
    fromStatus?: AlertStatusDto;
    toStatus?: AlertStatusDto;
    action: string;
    note?: string;
}

export interface AlertDriverDto {
    factor: string;
    impact: number;
}

export interface AlertRecommendationDto {
    intervention: string;
    estimatedImpact?: string;
    riskReduction?: string;
}

export interface AlertDetailsDto {
    alertId: string;
    summary: Record<string, any>;
    explanation?: {
        riskScore?: number;
        drivers?: AlertDriverDto[];
        thresholdExplanation?: string;
        historicalComparison?: string;
    };
    recommendations?: AlertRecommendationDto[];
    relatedCases?: { caseId: string; status: string; refType?: string }[];
    auditTrail: AlertAuditEventDto[];
}

function normalizeAlertStatus(status?: string | null): AlertStatusDto {
    const value = (status || '').toUpperCase();
    switch (value) {
        case 'NEW':
        case 'UNREAD':
            return 'UNREAD';
        case 'READ':
            return 'READ';
        case 'ACKNOWLEDGED':
            return 'ACKNOWLEDGED';
        case 'ACTIONED':
        case 'SENT':
            return 'ACTIONED';
        case 'CLOSED':
            return 'CLOSED';
        case 'ARCHIVED':
            return 'ARCHIVED';
        default:
            return 'NEW';
    }
}

function normalizeAlertType(type?: string | null): string {
    if (!type) return 'THRESHOLD_BREACH';
    return type.toUpperCase();
}

function mapSeverityFromEscalation(escalationLevel?: string | null): AlertSeverityDto {
    const value = (escalationLevel || '').toLowerCase();
    if (value === 'hr' || value === 'critical') return 'CRITICAL';
    if (value === 'manager' || value === 'high') return 'HIGH';
    if (value === 'medium') return 'MEDIUM';
    return 'LOW';
}

function normalizeImpactValue(value: string | number | null | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

export function mapAlertRowToDto(alert: AlertRow): AlertDto {
    const status = normalizeAlertStatus(alert.status);
    const title = `${normalizeAlertType(alert.type).replace(/_/g, ' ')} ALERT`;

    return {
        id: alert.id,
        type: normalizeAlertType(alert.type),
        severity: mapSeverityFromEscalation(alert.escalationLevel),
        status,
        title,
        description: `Operational alert for ${alert.relatedEntityType || 'system monitoring'}.`,
        triggeredAt: alert.createdAt ? new Date(alert.createdAt).toISOString() : new Date().toISOString(),
        isRead: !!alert.readAt || status === 'READ',
        channel: alert.channel,
        modelSource: alert.relatedEntityType || undefined,
    };
}

export function mapAlertAuditRowToDto(event: AlertAuditTrailRow): AlertAuditEventDto {
    return {
        id: event.id,
        alertId: event.alertId,
        actorUserId: event.actorUserId || 'system',
        at: event.createdAt ? new Date(event.createdAt).toISOString() : new Date().toISOString(),
        fromStatus: event.fromStatus ? normalizeAlertStatus(event.fromStatus) : undefined,
        toStatus: event.toStatus ? normalizeAlertStatus(event.toStatus) : undefined,
        action: event.action,
        note: event.note || undefined,
    };
}

export function mapAlertDetailsToDto(
    alert: AlertRow,
    drivers: AlertDriverRow[],
    recommendations: AlertRecommendationRow[],
    linkedCases: AlertLinkedCaseRow[],
    auditTrail: AlertAuditTrailRow[]
): AlertDetailsDto {
    const summaryAlert = mapAlertRowToDto(alert);

    const explanationDrivers = drivers.map((driver) => ({
        factor: driver.factor,
        impact: normalizeImpactValue(driver.impact),
    }));

    return {
        alertId: alert.id,
        summary: {
            ...summaryAlert,
            source: alert.channel,
            createdAt: alert.createdAt,
            sentAt: alert.sentAt,
            readAt: alert.readAt,
            relatedEntityType: alert.relatedEntityType,
            relatedEntityId: alert.relatedEntityId,
        },
        explanation: explanationDrivers.length > 0
            ? {
                drivers: explanationDrivers,
            }
            : undefined,
        recommendations: recommendations.map((recommendation) => ({
            intervention: recommendation.intervention,
            estimatedImpact: recommendation.estimatedImpact || undefined,
            riskReduction: recommendation.riskReduction || undefined,
        })),
        relatedCases: linkedCases.map((linkedCase) => ({
            caseId: linkedCase.caseId,
            status: 'LINKED',
            refType: linkedCase.refType || undefined,
        })),
        auditTrail: auditTrail.map(mapAlertAuditRowToDto),
    };
}
