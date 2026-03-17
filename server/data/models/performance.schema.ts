import { pgTable, uuid, varchar, timestamp, date, decimal, jsonb, integer } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';
import { users } from './users.schema';

export const perfCycles = pgTable('perf_cycles', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, active, closed, archived
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const perfAssessments = pgTable('perf_assessments', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    cycleId: uuid('cycle_id').references(() => perfCycles.id).notNull(),
    score: decimal('score', { precision: 5, scale: 2 }),
    measurementType: varchar('measurement_type', { length: 50 }).notNull(), // e.g., 'kpi', '360', 'manager_review'
    submittedBy: uuid('submitted_by').references(() => users.id), // Nullable as requested
    submittedAt: timestamp('submitted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const perfKpiScores = pgTable('perf_kpi_scores', {
    id: uuid('id').defaultRandom().primaryKey(),
    assessmentId: uuid('assessment_id').references(() => perfAssessments.id).notNull(),
    kpiCode: varchar('kpi_code', { length: 50 }).notNull(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    weight: decimal('weight', { precision: 5, scale: 2 }).default('1.0'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PerfCycle = typeof perfCycles.$inferSelect;
export type NewPerfCycle = typeof perfCycles.$inferInsert;

export type PerfAssessment = typeof perfAssessments.$inferSelect;
export type NewPerfAssessment = typeof perfAssessments.$inferInsert;

export type PerfKpiScore = typeof perfKpiScores.$inferSelect;
export type NewPerfKpiScore = typeof perfKpiScores.$inferInsert;
