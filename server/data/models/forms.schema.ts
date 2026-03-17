import { pgTable, uuid, varchar, timestamp, jsonb, integer, text, bigint } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { employeesLocal } from './employees-local.schema';

export const formTemplates = pgTable('form_templates', {
    id: uuid('id').defaultRandom().primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(), // e.g., 'leave_request', 'probation_review'
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('active'), // active, draft, archived
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const formVersions = pgTable('form_versions', {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id').references(() => formTemplates.id).notNull(),
    version: integer('version').notNull(),
    schemaJson: jsonb('schema_json').notNull(), // Form.io or internal schema definition
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const formSubmissions = pgTable('form_submissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id').references(() => formTemplates.id).notNull(),
    versionId: uuid('version_id').references(() => formVersions.id).notNull(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id), // Nullable (some forms might not target an employee)
    submittedBy: uuid('submitted_by').references(() => users.id), // Nullable (public forms or system generated)
    status: varchar('status', { length: 50 }).default('submitted'), // draft, submitted, approved, rejected
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

export const formAnswers = pgTable('form_answers', {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id').references(() => formSubmissions.id).notNull(),
    answersJson: jsonb('answers_json'), // The actual data
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const formAttachments = pgTable('form_attachments', {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id').references(() => formSubmissions.id).notNull(),
    storageProvider: varchar('storage_provider', { length: 50 }).default('local'), // local, s3
    objectKey: varchar('object_key', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type FormTemplate = typeof formTemplates.$inferSelect;
export type NewFormTemplate = typeof formTemplates.$inferInsert;

export type FormVersion = typeof formVersions.$inferSelect;
export type NewFormVersion = typeof formVersions.$inferInsert;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;

export type FormAnswer = typeof formAnswers.$inferSelect;
export type NewFormAnswer = typeof formAnswers.$inferInsert;

export type FormAttachment = typeof formAttachments.$inferSelect;
export type NewFormAttachment = typeof formAttachments.$inferInsert;
