import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { authSessions } from '../models/auth.schema';
import { eq, and, isNull } from 'drizzle-orm';

@injectable()
export class SessionsRepository extends BaseRepository<typeof authSessions> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, authSessions);
    }

    async listUserSessions(userId: string) {
        return this.db.select().from(authSessions).where(eq(authSessions.userId, userId)).orderBy(authSessions.createdAt);
    }

    async revokeSession(sessionId: string) {
        const result = await this.db.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.id, sessionId)).returning();
        return result[0];
    }

    async listActiveSessions(userId: string) {
        return this.db.select().from(authSessions).where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)));
    }
}
