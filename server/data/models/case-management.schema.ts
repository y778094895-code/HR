import { pgTable, uuid, varchar, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { employeesLocal } from './employees-local.schema';

export const cases = pgTable('cases', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 50 }).notNull(), // disciplinary, grievance, inquiry
    status: varchar('status', { length: 20 }).default('open').notNull(), // open, in_progress, resolved, closed
    priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, critical
    subjectEmployeeId: uuid('subject_employee_id').references(() => employeesLocal.id),
    reporterId: uuid('reporter_id').references(() => users.id),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const caseLogs = pgTable('case_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id').references(() => cases.id).notNull(),
    authorId: uuid('author_id').references(() => users.id).notNull(),
    note: text('note').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const caseAttachments = pgTable('case_attachments', {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id').references(() => cases.id).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: varchar('file_type', { length: 100 }),
    uploadedById: uuid('uploaded_by_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type CaseLog = typeof caseLogs.$inferSelect;
export type CaseAttachment = typeof caseAttachments.$inferSelect;
