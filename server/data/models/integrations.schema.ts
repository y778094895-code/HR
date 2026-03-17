import { pgTable, uuid, varchar, timestamp, jsonb, text } from 'drizzle-orm/pg-core';

export const externalSystems = pgTable('external_systems', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(), // e.g. 'salesforce', 'sap_successfactors'
    type: varchar('type', { length: 50 }).notNull(), // 'crm', 'erp', 'hrms'
    status: varchar('status', { length: 50 }).default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const integrationConnections = pgTable('integration_connections', {
    id: uuid('id').defaultRandom().primaryKey(),
    systemId: uuid('system_id').references(() => externalSystems.id).notNull(),
    baseUrl: varchar('base_url', { length: 255 }),
    authType: varchar('auth_type', { length: 50 }), // 'oauth2', 'api_key', 'basic'
    vaultSecretPath: varchar('vault_secret_path', { length: 255 }), // Path to secret in Vault/AWS Secrets Manager
    status: varchar('status', { length: 50 }).default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastError: text('last_error'),
});

export const integrationMappings = pgTable('integration_mappings', {
    id: uuid('id').defaultRandom().primaryKey(),
    systemId: uuid('system_id').references(() => externalSystems.id).notNull(),
    entityName: varchar('entity_name', { length: 100 }).notNull(), // e.g. 'employee', 'department'
    mappingJson: jsonb('mapping_json').notNull(), // Field mapping definitions
    version: varchar('version', { length: 20 }).default('v1'),
    active: varchar('active', { length: 10 }).default('true'), // using varchar for boolean-like status if preferred or standard boolean
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const syncRuns = pgTable('sync_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    systemId: uuid('system_id').references(() => externalSystems.id).notNull(),
    direction: varchar('direction', { length: 20 }).notNull(), // 'inbound', 'outbound'
    status: varchar('status', { length: 50 }).default('running'), // running, completed, failed
    startedAt: timestamp('started_at').defaultNow().notNull(),
    finishedAt: timestamp('finished_at'),
    stats: jsonb('stats'), // { processed: 100, failed: 2 }
});

export const syncItems = pgTable('sync_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    runId: uuid('run_id').references(() => syncRuns.id).notNull(),
    entityName: varchar('entity_name', { length: 100 }).notNull(),
    externalId: varchar('external_id', { length: 255 }),
    internalId: uuid('internal_id'), // Nullable
    status: varchar('status', { length: 50 }).notNull(), // 'synced', 'error', 'skipped'
    error: text('error'),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookInbox = pgTable('webhook_inbox', {
    id: uuid('id').defaultRandom().primaryKey(),
    systemId: uuid('system_id').references(() => externalSystems.id), // Nullable if unknown source
    eventType: varchar('event_type', { length: 100 }),
    externalEventId: varchar('external_event_id', { length: 255 }),
    signature: varchar('signature', { length: 500 }),
    payload: jsonb('payload'),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
    status: varchar('status', { length: 50 }).default('pending'), // pending, processed, failed
});

export const idempotencyKeys = pgTable('idempotency_keys', {
    key: varchar('key', { length: 255 }).primaryKey(),
    requestHash: varchar('request_hash', { length: 64 }).notNull(),
    responseJson: jsonb('response_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
});

export type ExternalSystem = typeof externalSystems.$inferSelect;
export type NewExternalSystem = typeof externalSystems.$inferInsert;

export type IntegrationConnection = typeof integrationConnections.$inferSelect;
export type NewIntegrationConnection = typeof integrationConnections.$inferInsert;

export type IntegrationMapping = typeof integrationMappings.$inferSelect;
export type NewIntegrationMapping = typeof integrationMappings.$inferInsert;

export type SyncRun = typeof syncRuns.$inferSelect;
export type NewSyncRun = typeof syncRuns.$inferInsert;

export type SyncItem = typeof syncItems.$inferSelect;
export type NewSyncItem = typeof syncItems.$inferInsert;

export type WebhookInbox = typeof webhookInbox.$inferSelect;
export type NewWebhookInbox = typeof webhookInbox.$inferInsert;
