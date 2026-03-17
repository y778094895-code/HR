import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const hrDepartments = pgTable('hr_departments', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    erpnextId: varchar('erpnext_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hrDesignations = pgTable('hr_designations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    erpnextId: varchar('erpnext_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type HrDepartment = typeof hrDepartments.$inferSelect;
export type NewHrDepartment = typeof hrDepartments.$inferInsert;

export type HrDesignation = typeof hrDesignations.$inferSelect;
export type NewHrDesignation = typeof hrDesignations.$inferInsert;
