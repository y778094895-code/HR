import { pgTable, uuid, varchar, timestamp, jsonb, text, date, decimal } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const alerts = pgTable('alerts', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: varchar('type', { length: 50 }).notNull(), // e.g., 'risk_threshold', 'training_due'
    channel: varchar('channel', { length: 50 }).notNull(), // 'email', 'in_app', 'slack'
    status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, sent, failed
    escalationLevel: varchar('escalation_level', { length: 20 }).default('none'), // none, manager, hr
    recipientUserId: uuid('recipient_user_id').references(() => users.id),
    relatedEntityType: varchar('related_entity_type', { length: 50 }),
    relatedEntityId: uuid('related_entity_id'),
    sentAt: timestamp('sent_at'),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reportDefinitions = pgTable('report_definitions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    templateJson: jsonb('template_json'), // Layout, data sources, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reportRuns = pgTable('report_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    definitionId: uuid('definition_id').references(() => reportDefinitions.id).notNull(),
    requestedBy: uuid('requested_by').references(() => users.id),
    status: varchar('status', { length: 50 }).default('processing').notNull(), // processing, completed, failed
    startedAt: timestamp('started_at').defaultNow().notNull(),
    finishedAt: timestamp('finished_at'),
});

export const reportOutputs = pgTable('report_outputs', {
    id: uuid('id').defaultRandom().primaryKey(),
    runId: uuid('run_id').references(() => reportRuns.id).notNull(),
    format: varchar('format', { length: 20 }).notNull(), // pdf, excel, csv
    periodStart: date('period_start'),
    periodEnd: date('period_end'),
    storageProvider: varchar('storage_provider', { length: 50 }).default('local'), // local, s3
    objectKey: varchar('object_key', { length: 255 }).notNull(), // Path/Key, NOT file content
    generatedAt: timestamp('generated_at').defaultNow().notNull(),
    status: varchar('status', { length: 50 }).default('available'), // available, expired, deleted
});

export const alertDrivers = pgTable('alert_drivers', {
    id: uuid('id').defaultRandom().primaryKey(),
    alertId: uuid('alert_id').references(() => alerts.id, { onDelete: 'cascade' }).notNull(),
    factor: text('factor').notNull(),
    impact: decimal('impact', { precision: 5, scale: 2 }),
    type: varchar('type', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertRecommendations = pgTable('alert_recommendations', {
    id: uuid('id').defaultRandom().primaryKey(),
    alertId: uuid('alert_id').references(() => alerts.id, { onDelete: 'cascade' }).notNull(),
    intervention: text('intervention').notNull(),
    estimatedImpact: text('estimated_impact'),
    riskReduction: text('risk_reduction'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertAuditTrail = pgTable('alert_audit_trail', {
    id: uuid('id').defaultRandom().primaryKey(),
    alertId: uuid('alert_id').references(() => alerts.id, { onDelete: 'cascade' }).notNull(),
    actorUserId: uuid('actor_user_id').references(() => users.id),
    action: varchar('action', { length: 50 }).notNull(),
    fromStatus: varchar('from_status', { length: 50 }),
    toStatus: varchar('to_status', { length: 50 }),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertLinkedCases = pgTable('alert_linked_cases', {
    id: uuid('id').defaultRandom().primaryKey(),
    alertId: uuid('alert_id').references(() => alerts.id, { onDelete: 'cascade' }).notNull(),
    caseId: varchar('case_id', { length: 100 }).notNull(),
    refType: varchar('ref_type', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export type ReportDefinition = typeof reportDefinitions.$inferSelect;
export type NewReportDefinition = typeof reportDefinitions.$inferInsert;

export type ReportRun = typeof reportRuns.$inferSelect;
export type NewReportRun = typeof reportRuns.$inferInsert;

export type ReportOutput = typeof reportOutputs.$inferSelect;
export type NewReportOutput = typeof reportOutputs.$inferInsert;

export type AlertDriver = typeof alertDrivers.$inferSelect;
export type NewAlertDriver = typeof alertDrivers.$inferInsert;

export type AlertRecommendation = typeof alertRecommendations.$inferSelect;
export type NewAlertRecommendation = typeof alertRecommendations.$inferInsert;

export type AlertAuditTrail = typeof alertAuditTrail.$inferSelect;
export type NewAlertAuditTrail = typeof alertAuditTrail.$inferInsert;

export type AlertLinkedCase = typeof alertLinkedCases.$inferSelect;
export type NewAlertLinkedCase = typeof alertLinkedCases.$inferInsert;
