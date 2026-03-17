import { injectable, inject } from 'inversify';
import { IAlertsService } from '../interfaces/i-alerts.service';
import { AlertsRepository } from '../../data/repositories/alerts.repository';
import { AlertDetailsDto, mapAlertDetailsToDto, mapAlertRowToDto } from '../../shared/dtos/alert.dto';
import { OutboxService } from '../../shared/infrastructure/outbox.service';

const ACTION_TO_STATUS: Record<string, string | undefined> = {
    ACKNOWLEDGE: 'ACKNOWLEDGED',
    ASSIGN: 'ACKNOWLEDGED',
    CONVERT_TO_CASE: 'ACTIONED',
    DISMISS: 'CLOSED',
    ESCALATE: 'ACTIONED',
    CLOSE: 'CLOSED',
    ARCHIVE: 'ARCHIVED',
    MARK_READ: 'READ',
};

@injectable()
export class AlertsService implements IAlertsService {
    constructor(
        @inject('AlertsRepository') private alertsRepo: AlertsRepository,
        @inject('OutboxService') private outboxService: OutboxService
    ) { }

async getAlerts(filters: any = {}, currentUserId?: string): Promise<{ items: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
        const effectiveFilters = {
            ...filters,
            ...(currentUserId && { recipientUserId: currentUserId })
        };
        const rows = await this.alertsRepo.find(effectiveFilters);
        const items = rows.map((row) => mapAlertRowToDto(row));

        return {
            items,
            total: items.length,
            page: Number(filters?.page) > 0 ? Number(filters.page) : 1,
            pageSize: Number(filters?.pageSize) > 0 ? Number(filters.pageSize) : items.length || 1,
            totalPages: 1,
        };
    }

    async getAlertDetails(alertId: string): Promise<AlertDetailsDto> {
        const bundle = await this.alertsRepo.getAlertDetailsBundle(alertId);
        if (!bundle) {
            throw new Error('Alert not found');
        }

        return mapAlertDetailsToDto(
            bundle.alert,
            bundle.drivers,
            bundle.recommendations,
            bundle.linkedCases,
            bundle.auditTrail
        );
    }

    async logAlertAction(
        alertId: string,
        action: string,
        userId: string,
        payload: any = {}
    ): Promise<{ success: boolean; eventId: string; toStatus?: string }> {
        const alert = await this.alertsRepo.findAlertById(alertId);
        if (!alert) {
            throw new Error('Alert not found');
        }

        const normalizedAction = (action || '').toUpperCase();
        const requestedStatus = payload?.toStatus || payload?.status;
        const normalizedRequestedStatus = requestedStatus
            ? String(requestedStatus).toUpperCase()
            : undefined;

        const toStatus = normalizedRequestedStatus || ACTION_TO_STATUS[normalizedAction];
        const fromStatus = this.mapDbStatusToApiStatus(alert.status);

        if (toStatus) {
            const dbStatus = this.mapApiStatusToDbStatus(toStatus);
            const timestampUpdates: Partial<{ readAt: Date; sentAt: Date }> = {};

            if (toStatus === 'READ' || toStatus === 'ACKNOWLEDGED' || toStatus === 'ACTIONED') {
                timestampUpdates.readAt = new Date();
            }
            if (toStatus === 'ACTIONED') {
                timestampUpdates.sentAt = new Date();
            }

            await this.alertsRepo.updateAlertStatus(alertId, dbStatus, timestampUpdates);
        }

        const event = await this.alertsRepo.appendAuditEvent({
            alertId,
            actorUserId: userId,
            action: normalizedAction,
            fromStatus,
            toStatus,
            note: payload?.note || payload?.comment || null,
        });

        await this.publishRealtimeEvent(alertId, fromStatus, toStatus, {
            action: normalizedAction,
            actorUserId: userId,
            note: payload?.note || payload?.comment || null,
        });

        return {
            success: true,
            eventId: event.id,
            toStatus,
        };
    }

    private mapDbStatusToApiStatus(status?: string | null): string {
        const value = (status || '').toLowerCase();
        if (value === 'acknowledged') return 'ACKNOWLEDGED';
        if (value === 'actioned' || value === 'sent') return 'ACTIONED';
        if (value === 'closed') return 'CLOSED';
        if (value === 'archived') return 'ARCHIVED';
        if (value === 'read') return 'READ';
        if (value === 'unread' || value === 'new') return 'UNREAD';
        return 'NEW';
    }

    private async publishRealtimeEvent(
        alertId: string,
        fromStatus: string,
        toStatus: string | undefined,
        meta: Record<string, any>
    ): Promise<void> {
        const eventType = !toStatus
            ? 'alert:updated'
            : fromStatus === 'NEW' && toStatus === 'NEW'
                ? 'alert:new'
                : toStatus === 'ARCHIVED' || toStatus === 'CLOSED'
                    ? 'alert:deleted'
                    : 'alert:updated';

        try {
            await this.outboxService.storeEvent('notification', eventType, {
                alertId,
                fromStatus,
                toStatus,
                ...meta,
                occurredAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('[AlertsService] Failed to enqueue realtime alert event, continuing without websocket publish:', error);
        }
    }

    private mapApiStatusToDbStatus(status: string): string {
        const value = status.toUpperCase();
        if (value === 'UNREAD') return 'unread';
        if (value === 'READ') return 'read';
        if (value === 'ACKNOWLEDGED') return 'acknowledged';
        if (value === 'ACTIONED') return 'actioned';
        if (value === 'CLOSED') return 'closed';
        if (value === 'ARCHIVED') return 'archived';
        if (value === 'NEW') return 'new';
        return status.toLowerCase();
    }
}
