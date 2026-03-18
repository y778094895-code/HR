import {
  pgTable, uuid, varchar, text, timestamp, date, numeric, pgEnum,
} from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';
import { performanceCycles } from './performance-goals.schema';
import { users } from './users.schema';

export const goalStatusEnum = pgEnum('goal_status', [
  'draft', 'in_progress', 'overdue', 'completed', 'archived',
]);

export const kpiFrequencyEnum = pgEnum('kpi_frequency', [
  'daily', 'weekly', 'monthly',
]);

export const objectiveStatusEnum = pgEnum('objective_status', [
  'active', 'closed',
]);

// Organisational objectives (HR-level)
export const orgObjectives = pgTable('org_objectives', {
  id:          uuid('id').defaultRandom().primaryKey(),
  title:       varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  ownerId:     uuid('owner_id').references(() => users.id),
  targetDate:  date('target_date'),
  status:      objectiveStatusEnum('status').notNull().default('active'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

// Goals (employee-level)
export const goals = pgTable('goals', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  employeeId:          uuid('employee_id').references(() => employeesLocal.id).notNull(),
  cycleId:             uuid('cycle_id').references(() => performanceCycles.id),
  parentObjectiveId:   uuid('parent_objective_id').references(() => orgObjectives.id),
  title:               varchar('title', { length: 500 }).notNull(),
  description:         text('description'),
  category:            varchar('category', { length: 100 }).notNull().default('performance'),
  targetValue:         numeric('target_value', { precision: 14, scale: 4 }),
  currentValue:        numeric('current_value', { precision: 14, scale: 4 }).notNull().default('0'),
  unit:                varchar('unit', { length: 50 }),
  weight:              numeric('weight', { precision: 5, scale: 2 }).notNull().default('0'),
  dueDate:             date('due_date'),
  status:              goalStatusEnum('status').notNull().default('draft'),
  createdBy:           uuid('created_by').references(() => users.id),
  createdAt:           timestamp('created_at').defaultNow().notNull(),
  updatedAt:           timestamp('updated_at').defaultNow().notNull(),
});

// KPIs (child metrics per goal)
export const kpis = pgTable('kpis', {
  id:                   uuid('id').defaultRandom().primaryKey(),
  goalId:               uuid('goal_id').references(() => goals.id).notNull(),
  name:                 varchar('name', { length: 255 }).notNull(),
  targetValue:          numeric('target_value', { precision: 14, scale: 4 }).notNull(),
  currentValue:         numeric('current_value', { precision: 14, scale: 4 }).notNull().default('0'),
  unit:                 varchar('unit', { length: 50 }),
  measurementFrequency: kpiFrequencyEnum('measurement_frequency').notNull().default('monthly'),
  lastUpdatedAt:        timestamp('last_updated_at'),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
});

export type Goal    = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Kpi     = typeof kpis.$inferSelect;
export type NewKpi  = typeof kpis.$inferInsert;
export type OrgObjective    = typeof orgObjectives.$inferSelect;
export type NewOrgObjective = typeof orgObjectives.$inferInsert;
