import 'reflect-metadata';
import { AlertsService } from '../../services/business/alerts.service';

describe('AlertsService', () => {
    const outboxServiceMock: any = {
        storeEvent: jest.fn().mockResolvedValue(undefined),
    };
    const baseAlert: any = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'attrition_risk',
        channel: 'in_app',
        status: 'new',
        escalationLevel: 'manager',
        recipientUserId: null,
        relatedEntityType: 'risk_engine',
        relatedEntityId: null,
        sentAt: null,
        readAt: null,
        createdAt: new Date('2026-03-06T00:00:00.000Z'),
    };

    it('returns composite alert details bundle mapped to DTO', async () => {
        const repo: any = {
            find: jest.fn().mockResolvedValue([baseAlert]),
            getAlertDetailsBundle: jest.fn().mockResolvedValue({
                alert: baseAlert,
                drivers: [
                    {
                        id: 'd1',
                        alertId: baseAlert.id,
                        factor: 'Overtime surge',
                        impact: '0.82',
                        type: 'workload',
                        createdAt: new Date('2026-03-06T00:00:00.000Z'),
                    },
                ],
                recommendations: [
                    {
                        id: 'r1',
                        alertId: baseAlert.id,
                        intervention: 'Schedule targeted retention interview',
                        estimatedImpact: 'Reduce risk by 20%',
                        riskReduction: '0.20',
                        createdAt: new Date('2026-03-06T00:00:00.000Z'),
                    },
                ],
                linkedCases: [
                    {
                        id: 'l1',
                        alertId: baseAlert.id,
                        caseId: 'CASE-123',
                        refType: 'INVESTIGATION',
                        createdAt: new Date('2026-03-06T00:00:00.000Z'),
                    },
                ],
                auditTrail: [
                    {
                        id: 'a1',
                        alertId: baseAlert.id,
                        actorUserId: 'user-1',
                        action: 'ACKNOWLEDGE',
                        fromStatus: 'NEW',
                        toStatus: 'ACKNOWLEDGED',
                        note: 'Owner acknowledged the alert',
                        createdAt: new Date('2026-03-06T00:00:00.000Z'),
                    },
                ],
            }),
        };

        const service = new AlertsService(repo, outboxServiceMock);
        const details = await service.getAlertDetails(baseAlert.id);

        expect(details.alertId).toBe(baseAlert.id);
        expect(details.summary.type).toBe('ATTRITION_RISK');
        expect(details.explanation?.drivers?.[0].factor).toBe('Overtime surge');
        expect(details.recommendations?.[0].intervention).toContain('retention interview');
        expect(details.relatedCases?.[0].caseId).toBe('CASE-123');
        expect(details.auditTrail[0].action).toBe('ACKNOWLEDGE');
    });

    it('logs alert action and updates status transition', async () => {
        const repo: any = {
            findAlertById: jest.fn().mockResolvedValue(baseAlert),
            updateAlertStatus: jest.fn().mockResolvedValue({ ...baseAlert, status: 'acknowledged' }),
            appendAuditEvent: jest.fn().mockResolvedValue({ id: 'evt-1' }),
        };

        const service = new AlertsService(repo, outboxServiceMock);
        const result = await service.logAlertAction(baseAlert.id, 'ACKNOWLEDGE', 'user-99', {
            note: 'Taking ownership',
        });

        expect(repo.updateAlertStatus).toHaveBeenCalledWith(
            baseAlert.id,
            'acknowledged',
            expect.objectContaining({ readAt: expect.any(Date) })
        );

        expect(repo.appendAuditEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                alertId: baseAlert.id,
                actorUserId: 'user-99',
                action: 'ACKNOWLEDGE',
                fromStatus: 'UNREAD',
                toStatus: 'ACKNOWLEDGED',
                note: 'Taking ownership',
            })
        );

        expect(result.success).toBe(true);
        expect(result.eventId).toBe('evt-1');
        expect(result.toStatus).toBe('ACKNOWLEDGED');
        expect(outboxServiceMock.storeEvent).toHaveBeenCalledWith(
            'notification',
            'alert:updated',
            expect.objectContaining({
                alertId: baseAlert.id,
                fromStatus: 'UNREAD',
                toStatus: 'ACKNOWLEDGED',
                action: 'ACKNOWLEDGE',
            })
        );
    });

    it('throws when alert does not exist', async () => {
        const repo: any = {
            findAlertById: jest.fn().mockResolvedValue(null),
        };

        const service = new AlertsService(repo, outboxServiceMock);
        await expect(service.logAlertAction('missing-id', 'ACKNOWLEDGE', 'user-99')).rejects.toThrow('Alert not found');
    });
});
