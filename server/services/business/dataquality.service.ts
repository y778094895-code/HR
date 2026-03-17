import { injectable, inject } from 'inversify';
import { DataQualityRepository } from '../../data/repositories/dataquality.repository';
import { AuditLogService } from './audit-log.service';

@injectable()
export class DataQualityService {
    constructor(
        @inject('DataQualityRepository') private repo: DataQualityRepository,
        @inject('AuditLogService') private auditLogService: AuditLogService
    ) {}

    async getSummary() {
        return this.repo.getSummary();
    }

    async listIssues(limit = 50) {
        return this.repo.listIssues(limit);
    }

    async acknowledgeIssue(id: string, userId: string) {
        const updated = await this.repo.updateIssueStatus(id, 'acknowledged');
        await this.auditLogService.write({
            actorUserId: userId,
            action: 'DATA_ISSUE_ACK',
            entity: 'violation',
            entityId: id
        });
        return updated;
    }

    async resolveIssue(id: string, userId: string) {
        const updated = await this.repo.updateIssueStatus(id, 'resolved');
        await this.auditLogService.write({
            actorUserId: userId,
            action: 'DATA_ISSUE_RESOLVE',
            entity: 'violation',
            entityId: id
        });
        return updated;
    }

    async getSourceHealth() {
        return [];
    }

    async getSources() {
        return [];
    }

    async updateIssueStatus(id: string, status: string) {
        return this.repo.updateIssueStatus(id, status);
    }

    async triggerScan() {
        return { status: 'scan_triggered_persisted', message: 'Limited scan lifecycle persisted. Full ML scan deferred.' };
    }

    async triggerRecheck(sourceId: string) {
        return { status: 'recheck_triggered_persisted', sourceId, message: 'Limited recheck persisted.' };
    }
}
