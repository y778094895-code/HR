import { pgTable, uuid, varchar, decimal, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';

export const turnoverRisk = pgTable('turnover_risk', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    riskScore: decimal('risk_score', { precision: 5, scale: 4 }).notNull(),
    riskLevel: varchar('risk_level', { length: 20 }).notNull(),
    confidenceScore: decimal('confidence_score', { precision: 5, scale: 4 }),
    contributingFactors: jsonb('contributing_factors'),
    predictionDate: timestamp('prediction_date').defaultNow(),
    predictionValidUntil: timestamp('prediction_valid_until'),
    mlModelVersion: varchar('ml_model_version', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
});
