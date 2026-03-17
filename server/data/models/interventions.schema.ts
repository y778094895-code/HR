import { pgTable, uuid, varchar, text, timestamp, date, decimal, jsonb } from 'drizzle-orm/pg-core';
import { users } from './index';
import { employeesLocal } from './employees-local.schema';
import { riskCases } from './risk.schema';

export const interventions = pgTable('interventions', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('planned'), // planned, in_progress, completed, cancelled
    priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, critical
    ownerId: uuid('owner_id').references(() => users.id),
    riskCaseId: uuid('risk_case_id').references(() => riskCases.id),
    rationale: jsonb('rationale'),
    actionPlan: jsonb('action_plan'),
    expectedOutcome: jsonb('expected_outcome'),
    actualOutcome: jsonb('actual_outcome'),
    dueDate: timestamp('due_date'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recommendations = pgTable('recommendations', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id),
    department: varchar('department', { length: 100 }),
    source: varchar('source', { length: 50 }).default('ml').notNull(), // ml, rule, manual
    recommendationType: varchar('recommendation_type', { length: 100 }).notNull(), // retention, fairness, performance, wellbeing, compensation, promotion
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    confidence: decimal('confidence', { precision: 5, scale: 2 }),
    estimatedImpact: jsonb('estimated_impact'),
    status: varchar('status', { length: 50 }).default('active'), // active, accepted, rejected, applied, expired
    reasonCodes: jsonb('reason_codes'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const interventionEvents = pgTable('intervention_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    interventionId: uuid('intervention_id').references(() => interventions.id, { onDelete: 'cascade' }).notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(), // created, assigned, status_changed, commented, closed, overdue
    actorId: uuid('actor_id').references(() => users.id),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Intervention = typeof interventions.$inferSelect;
export type NewIntervention = typeof interventions.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;
export type InterventionEvent = typeof interventionEvents.$inferSelect;
export type NewInterventionEvent = typeof interventionEvents.$inferInsert;
