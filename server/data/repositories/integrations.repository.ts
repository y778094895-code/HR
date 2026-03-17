import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { integrationConnections, externalSystems } from '../models/index';
import { eq, sql } from 'drizzle-orm';

@injectable()
export class IntegrationsRepository extends BaseRepository<typeof integrationConnections> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, integrationConnections);
    }

    async listConnections() {
        // Selection of fields to avoid missing property errors during mapping
        const rows = await this.db.select().from(integrationConnections).leftJoin(externalSystems, eq(integrationConnections.systemId, externalSystems.id));
        
        return rows.map(row => {
            const conn = row.integration_connections;
            const system = row.external_systems;
            
            return {
                id: conn.id,
                type: (system as any)?.type || 'custom',
                name: (system as any)?.name || 'Unknown System',
                description: (system as any)?.description || '',
                status: conn.status || 'disconnected',
                connectedAt: (conn as any).createdAt || null,
                lastSyncAt: (conn as any).updatedAt || null,
                config: {}, 
                capabilities: []
            };
        });
    }

    async getConnectionStatus(id: string) {
        const result = await this.db.select().from(integrationConnections).where(eq(integrationConnections.id, id));
        return result[0];
    }

async connect(systemId: string, baseUrl: string, authType: string) {
        const [existing] = await this.db.select().from(integrationConnections).where(eq(integrationConnections.systemId, systemId));
        if (existing) {
            await this.db.update(integrationConnections).set({ 
                status: 'reconnecting',
                baseUrl,
                authType
            }).where(eq(integrationConnections.id, existing.id));
            return existing;
        }
        const result = await this.db.insert(integrationConnections).values({ systemId, baseUrl, authType, status: 'connecting' }).returning();
        return result[0];
    }


    async disconnect(id: string) {
        const result = await this.db.update(integrationConnections).set({ status: 'disconnected' }).where(eq(integrationConnections.id, id)).returning();
        return result[0];
    }

    async triggerSync(id: string) {
        await this.db.update(integrationConnections).set({ 
            status: 'synced_attempted',
            lastError: 'External sync deferred - honest limited lifecycle.'
        }).where(eq(integrationConnections.id, id));
        const result = await this.db.select().from(integrationConnections).where(eq(integrationConnections.id, id));
        return result[0];
    }


    async getSyncStatus(id: string) {
        return this.getConnectionStatus(id);
    }

    async getConnection(id: string) {
        return this.getConnectionStatus(id);
    }

    async reconnect(id: string) {
        const result = await this.db.update(integrationConnections)
            .set({ status: 'reconnecting' })
            .where(eq(integrationConnections.id, id))
            .returning();
        return result[0];
    }

    async updateConfig(id: string, config: any) {
        const result = await this.db.update(integrationConnections)
            .set({ authType: config.authType || undefined, baseUrl: config.baseUrl || undefined })
            .where(eq(integrationConnections.id, id))
            .returning();
        return result[0];
    }

    async testConnection(id: string) {
        const conn = await this.getConnectionStatus(id);
        return {
            success: !!conn,
            message: conn ? 'Connection record exists - external validation deferred' : 'Connection not found',
        };
    }
}
