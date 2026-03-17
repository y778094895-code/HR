import { pgTable, uuid, text, timestamp, jsonb, integer, varchar } from 'drizzle-orm/pg-core';

export const outbox = pgTable('outbox', {
    id: uuid('id').defaultRandom().primaryKey(),
    service: varchar('service', { length: 100 }).notNull(),
    eventType: varchar('event_type', { length: 255 }).notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 50 }).default('PENDING').notNull(),
    retryCount: integer('retry_count').default(0).notNull(),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
});

export type OutboxEvent = typeof outbox.$inferSelect;
export type NewOutboxEvent = typeof outbox.$inferInsert;
