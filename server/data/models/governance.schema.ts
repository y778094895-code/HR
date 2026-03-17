import { pgTable, uuid, varchar, timestamp, jsonb, integer, text } from 'drizzle-orm/pg-core';

export const dataGovernance = pgTable('data_governance', {
    id: uuid('id').defaultRandom().primaryKey(),
    srcName: varchar('src_name', { length: 100 }).notNull().unique(),
    retentionDays: integer('retention_days').default(365),
    rules: jsonb('rules'), // QoS rules, validation logic
    cleanupLogs: jsonb('cleanup_logs'), // Audit logs for data cleanup
    status: varchar('status', { length: 50 }).default('active'),
    admin: varchar('admin', { length: 100 }), // Admin user/role responsible
    securityControls: jsonb('security_controls'), // Access control metadata
    integrationInterfaces: jsonb('integration_interfaces'), // Schema mappings/API definitions
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const policies = pgTable('policies', {
    id: uuid('id').defaultRandom().primaryKey(),
    policyName: varchar('policy_name', { length: 100 }).notNull().unique(),
    ruleJson: jsonb('rule_json'), // Logic for method enforcement
    status: varchar('status', { length: 50 }).default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const violations = pgTable('violations', {
    id: uuid('id').defaultRandom().primaryKey(),
    policyId: uuid('policy_id').references(() => policies.id).notNull(),
    severity: varchar('severity', { length: 20 }).notNull(), // low, medium, high, critical
    status: varchar('status', { length: 50 }).default('open'),
    description: text('description'),
    relatedEntityType: varchar('related_entity_type', { length: 50 }),
    relatedEntityId: uuid('related_entity_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DataGovernance = typeof dataGovernance.$inferSelect;
export type NewDataGovernance = typeof dataGovernance.$inferInsert;

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;

export type Violation = typeof violations.$inferSelect;
export type NewViolation = typeof violations.$inferInsert;
