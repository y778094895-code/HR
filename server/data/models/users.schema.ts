import { pgTable, uuid, text, boolean, timestamp, varchar, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('employee').notNull(),
    department: varchar('department', { length: 100 }),
    designation: varchar('designation', { length: 100 }),
    settings: jsonb('settings').default('{}'),
    isActive: boolean('is_active').default(true).notNull(),
    isLocked: boolean('is_locked').default(false).notNull(),
    mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
    mfaSetupCompleted: boolean('mfa_setup_completed').default(false).notNull(),
    mfaBackupCodes: jsonb('mfa_backup_codes').default('[]'),
    mfaLastVerified: timestamp('mfa_last_verified'),
    failedLoginAttempts: integer('failed_login_attempts').default(0),
    lastLoginAt: timestamp('last_login_at'),
    passwordChangedAt: timestamp('password_changed_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

