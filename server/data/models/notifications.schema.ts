import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * Notifications table — persists user notifications for delivery and tracking.
 * Source of truth: ARCHITECTURE.md notifications specification.
 *
 * Extension points:
 * - Delivery channels (email, SMS, push) tracked via channel column
 * - Batch notification creation for announcements
 * - Notification templates system
 * - Priority-based delivery ordering
 */
export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'alert', 'info', 'warning', 'success', 'system'
    category: varchar('category', { length: 50 }).default('general'), // 'risk', 'performance', 'system', 'hr', 'general'
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at'),
    priority: varchar('priority', { length: 20 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
    channel: varchar('channel', { length: 20 }).default('in_app'), // 'in_app', 'email', 'sms', 'push'
    metadata: jsonb('metadata').default('{}'),
    relatedEntityType: varchar('related_entity_type', { length: 50 }), // 'employee', 'report', 'alert', etc.
    relatedEntityId: uuid('related_entity_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
