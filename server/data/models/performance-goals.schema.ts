import { pgTable, uuid, varchar, text, timestamp, jsonb, date, numeric } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';

export const performanceCycles = pgTable('performance_cycles', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    status: varchar('status', { length: 20 }).default('upcoming').notNull(), // active, closed, upcoming
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employeeGoals = pgTable('employee_goals', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    cycleId: uuid('cycle_id').references(() => performanceCycles.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, in_progress, completed, cancelled
    progress: numeric('progress', { precision: 5, scale: 2 }).default('0'), // 0-100
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type PerformanceCycle = typeof performanceCycles.$inferSelect;
export type NewPerformanceCycle = typeof performanceCycles.$inferInsert;

export type EmployeeGoal = typeof employeeGoals.$inferSelect;
export type NewEmployeeGoal = typeof employeeGoals.$inferInsert;
