import { injectable, inject } from 'inversify';
import { DatabaseConnection } from '../../data/database/connection';
import { auditLog, NewAuditLogEntry } from '../../data/models/auth.schema';

interface AuditPayload {
    actorUserId?: string | null;
    action: string;
    entity: string;
    entityId: string;
    metadata?: any;
    ip?: string | null;
}

@injectable()
export class AuditLogService {
    constructor(@inject('DatabaseConnection') private dbConnection: DatabaseConnection) {}

    async write(entry: AuditPayload): Promise<void> {
        const payload: NewAuditLogEntry = {
            actorUserId: entry.actorUserId || null,
            action: entry.action,
            entity: entry.entity,
            entityId: entry.entityId,
            metadata: entry.metadata ?? null,
            ip: entry.ip || null,
        };

        await this.dbConnection.db.insert(auditLog).values(payload);
    }
}
