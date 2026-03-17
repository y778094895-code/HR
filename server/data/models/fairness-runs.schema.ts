import { pgTable, uuid, varchar, timestamp, date, decimal, jsonb, text } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const fairnessRuns = pgTable('fairness_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    runDate: timestamp('run_date').defaultNow().notNull(),
    datasetRef: varchar('dataset_ref', { length: 255 }), // e.g. "dataset_v1_2023"
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id), // Nullable
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const fairnessMetricValues = pgTable('fairness_metric_values', {
    id: uuid('id').defaultRandom().primaryKey(),
    runId: uuid('run_id').references(() => fairnessRuns.id).notNull(),
    metric: varchar('metric', { length: 100 }).notNull(), // e.g. "disparate_impact", "equal_opportunity"
    group: varchar('group', { length: 100 }).notNull(), // e.g. "gender:female", "ethnicity:asian"
    value: decimal('value', { precision: 8, scale: 4 }),
    thresholds: jsonb('thresholds'), // { "min": 0.8, "max": 1.25 }
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type FairnessRun = typeof fairnessRuns.$inferSelect;
export type NewFairnessRun = typeof fairnessRuns.$inferInsert;

export type FairnessMetricValue = typeof fairnessMetricValues.$inferSelect;
export type NewFairnessMetricValue = typeof fairnessMetricValues.$inferInsert;
