﻿import { injectable, inject } from 'inversify';
import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import {
    alerts,
    alertDrivers,
    alertRecommendations,
    alertAuditTrail,
    alertLinkedCases,
    NewAlertAuditTrail,
} from '../models/alerts-reports.schema';

export interface AlertFilters {
    status?: string;
    severity?: string;
    type?: string;
    channel?: string;
    recipientUserId?: string;
}

@injectable()
export class AlertsRepository extends BaseRepository<typeof alerts> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, alerts);
    }

    async find(filters: AlertFilters = {}) {
        const conditions: any[] = [];

        if (filters.status && filters.status !== 'ALL') {
            const normalizedStatus = filters.status.toUpperCase();
            if (normalizedStatus === 'UNREAD') {
                conditions.push(isNull(alerts.readAt));
            } else if (normalizedStatus === 'READ') {
                conditions.push(isNotNull(alerts.readAt));
            } else {
                conditions.push(eq(alerts.status, normalizedStatus.toLowerCase()));
            }
        }

        if (filters.type && filters.type !== 'ALL') {
            conditions.push(eq(alerts.type, filters.type.toLowerCase()));
        }

        if (filters.channel && filters.channel !== 'ALL') {
            conditions.push(eq(alerts.channel, filters.channel.toLowerCase()));
        }

        if (filters.severity && filters.severity !== 'ALL') {
            const escalationLevel = this.mapSeverityToEscalation(filters.severity);
            if (escalationLevel) {
                conditions.push(eq(alerts.escalationLevel, escalationLevel));
            }
        }

        if (filters.recipientUserId) {
            conditions.push(eq(alerts.recipientUserId, filters.recipientUserId));
        }

        const baseQuery = this.db.select().from(alerts);
        const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

        return query.orderBy(desc(alerts.createdAt));
    }

    async findEmployeeAlerts(employeeId: string, limit: number = 10) {
        const conditions = [
            eq((alerts as any).relatedEntityType, 'employee'),
            eq((alerts as any).relatedEntityId, employeeId)
        ];

        return this.db
            .select()
            .from(alerts)
            .where(and(...conditions))
            .orderBy(desc(alerts.createdAt))
            .limit(limit);
    }

    async findAlertById(alertId: string) {
        const rows = await this.db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
        return rows[0] || null;
    }

    async getAlertDetailsBundle(alertId: string) {
        const alert = await this.findAlertById(alertId);
        if (!alert) return null;

        const [drivers, recommendations, linkedCases, auditTrail] = await Promise.all([
            this.db.select().from(alertDrivers).where(eq(alertDrivers.alertId, alertId)),
            this.db.select().from(alertRecommendations).where(eq(alertRecommendations.alertId, alertId)),
            this.db.select().from(alertLinkedCases).where(eq(alertLinkedCases.alertId, alertId)),
            this.db
                .select()
                .from(alertAuditTrail)
                .where(eq(alertAuditTrail.alertId, alertId))
                .orderBy(desc(alertAuditTrail.createdAt)),
        ]);

        return {
            alert,
            drivers,
            recommendations,
            linkedCases,
            auditTrail,
        };
    }

    async appendAuditEvent(payload: NewAlertAuditTrail) {
        const rows = await this.db.insert(alertAuditTrail).values(payload).returning();
        return rows[0];
    }

    async updateAlertStatus(alertId: string, status: string, updates: Partial<{ readAt: Date; sentAt: Date }> = {}) {
        const rows = await this.db
            .update(alerts)
            .set({
                status,
                ...updates,
            })
            .where(eq(alerts.id, alertId))
            .returning();

        return rows[0] || null;
    }

    private mapSeverityToEscalation(severity: string): string | null {
        const value = severity.toUpperCase();
        if (value === 'CRITICAL') return 'hr';
        if (value === 'HIGH') return 'manager';
        if (value === 'MEDIUM') return 'medium';
        if (value === 'LOW') return 'none';
        return null;
    }
}

