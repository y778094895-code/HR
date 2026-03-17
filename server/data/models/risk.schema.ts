import { pgTable, uuid, varchar, timestamp, date, decimal, jsonb, text } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';
import { users } from './users.schema';
import { hrDepartments } from './hr-master.schema';

export const riskCases = pgTable('risk_cases', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    riskRatio: decimal('risk_ratio', { precision: 5, scale: 2 }), // 0.00 to 100.00
    thresholdClassification: varchar('threshold_classification', { length: 50 }), // low, medium, high, critical
    status: varchar('status', { length: 50 }).default('open'), // open, investigating, mitgated, closed
    ownerUserId: uuid('owner_user_id').references(() => users.id), // Nullable
    topRiskFactors: jsonb('top_risk_factors'),
    openedAt: timestamp('opened_at').defaultNow().notNull(),
    closedAt: timestamp('closed_at'),
});

export const resignationEvents = pgTable('resignation_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    exitDate: date('exit_date').notNull(),
    exitReason: varchar('exit_reason', { length: 100 }),
    costEstimate: decimal('cost_estimate', { precision: 12, scale: 2 }),
    fairnessRunId: uuid('fairness_run_id'), // Placeholder for future link
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const turnoverReports = pgTable('turnover_reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    departmentId: uuid('department_id').references(() => hrDepartments.id), // Nullable
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    turnoverKpi: decimal('turnover_kpi', { precision: 5, scale: 2 }),
    factors: jsonb('factors'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type RiskCase = typeof riskCases.$inferSelect;
export type NewRiskCase = typeof riskCases.$inferInsert;

export type ResignationEvent = typeof resignationEvents.$inferSelect;
export type NewResignationEvent = typeof resignationEvents.$inferInsert;

export type TurnoverReport = typeof turnoverReports.$inferSelect;
export type NewTurnoverReport = typeof turnoverReports.$inferInsert;
