import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

// Auth Core Tables
export const authRoles = pgTable('auth_roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    key: varchar('key', { length: 50 }).unique(), // 'system_admin', 'hr_manager', etc.
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const authPermissions = pgTable('auth_permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: varchar('action', { length: 100 }).notNull(), // e.g., 'read:users'
    resource: varchar('resource', { length: 100 }).notNull(), // e.g., 'users'
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Join Tables (M:N)
export const authUserRoles = pgTable('auth_user_roles', {
    userId: uuid('user_id').references(() => users.id).notNull(),
    roleId: uuid('role_id').references(() => authRoles.id).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

export const authRolePermissions = pgTable('auth_role_permissions', {
    roleId: uuid('role_id').references(() => authRoles.id).notNull(),
    permissionId: uuid('permission_id').references(() => authPermissions.id).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// Sessions & Tokens
export const authSessions = pgTable('auth_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
});

export const authRefreshTokens = pgTable('auth_refresh_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    sessionId: uuid('session_id').references(() => authSessions.id).notNull(),
    tokenHash: text('token_hash').notNull(),
    rotatedFromId: uuid('rotated_from_id'), // Self-reference if needed, but keeping simple for now
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
});

export const authTokenRevocations = pgTable('auth_token_revocations', {
    id: uuid('id').defaultRandom().primaryKey(),
    jti: varchar('jti', { length: 255 }).notNull().unique(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    revokedAt: timestamp('revoked_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(), // When the token would have expired
    reason: text('reason'),
});

// Audit Log (Mapped to existing 'audit_logs' table to preserve data/prevent prompts)
export const auditLog = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: uuid('actor_id').references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(),
    entity: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    metadata: jsonb('metadata'),
    ip: varchar('ip', { length: 45 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type Exports
export type AuthRole = typeof authRoles.$inferSelect;
export type NewAuthRole = typeof authRoles.$inferInsert;

export type AuthPermission = typeof authPermissions.$inferSelect;
export type NewAuthPermission = typeof authPermissions.$inferInsert;

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
