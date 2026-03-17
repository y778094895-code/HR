import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const xaiExplanations = pgTable('xai_explanations', {
    id: uuid('id').defaultRandom().primaryKey(),
    entityType: varchar('entity_type', { length: 50 }).notNull(), // e.g. "employee", "risk_case", "intervention"
    entityId: uuid('entity_id').notNull(),
    explanationJson: jsonb('explanation_json'), // SHAP values, feature importance, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type XaiExplanation = typeof xaiExplanations.$inferSelect;
export type NewXaiExplanation = typeof xaiExplanations.$inferInsert;
