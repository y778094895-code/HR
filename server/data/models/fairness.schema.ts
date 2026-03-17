import { pgTable, uuid, varchar, decimal, timestamp, date, integer, jsonb } from 'drizzle-orm/pg-core';

export const fairnessMetrics = pgTable('fairness_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    metricName: varchar('metric_name', { length: 100 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    subcategory: varchar('subcategory', { length: 100 }),
    value: decimal('value', { precision: 10, scale: 4 }).notNull(),
    threshold: decimal('threshold', { precision: 10, scale: 4 }),
    status: varchar('status', { length: 20 }),
    analysisDate: date('analysis_date').notNull(),
    department: varchar('department', { length: 100 }),
    sampleSize: integer('sample_size'),
    confidenceInterval: jsonb('confidence_interval'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const compensationHistory = pgTable('compensation_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').notNull(), // Link to employee
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('SAR'),
    effectiveDate: date('effective_date').notNull(),
    reason: varchar('reason', { length: 100 }), // promotion, annual, adjustment
    createdAt: timestamp('created_at').defaultNow(),
});

export const diversityMetrics = pgTable('diversity_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').notNull(),
    gender: varchar('gender', { length: 20 }),
    ageGroup: varchar('age_group', { length: 20 }),
    ethnicity: varchar('ethnicity', { length: 50 }),
    disabilityStatus: varchar('disability_status', { length: 50 }),
    count: integer('count').default(1),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type FairnessMetric = typeof fairnessMetrics.$inferSelect;
export type CompensationHistory = typeof compensationHistory.$inferSelect;
export type DiversityMetric = typeof diversityMetrics.$inferSelect;
