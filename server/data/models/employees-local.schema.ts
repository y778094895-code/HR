
import { pgTable, uuid, varchar, text, date, decimal, timestamp } from 'drizzle-orm/pg-core';
import { hrDepartments, hrDesignations } from './hr-master.schema';

export const employeesLocal = pgTable('employees_local', {
    id: uuid('id').defaultRandom().primaryKey(),
    erpnextId: varchar('erpnext_id', { length: 100 }).notNull().unique(),
    employeeCode: varchar('employee_code', { length: 50 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 50 }),
    department: varchar('department', { length: 100 }),
    designation: varchar('designation', { length: 100 }),
    departmentId: uuid('department_id').references(() => hrDepartments.id),
    designationId: uuid('designation_id').references(() => hrDesignations.id),
    managerId: uuid('manager_id'), // Self-reference handled at runtime or via further config
    dateOfJoining: date('date_of_joining').notNull(),
    dateOfBirth: date('date_of_birth'),
    gender: varchar('gender', { length: 20 }),
    maritalStatus: varchar('marital_status', { length: 20 }),
    employmentType: varchar('employment_type', { length: 50 }),
    employmentStatus: varchar('employment_status', { length: 50 }).default('active'),
    salary: decimal('salary', { precision: 12, scale: 2 }),
    costCenter: varchar('cost_center', { length: 100 }),
    location: varchar('location', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    lastSyncAt: timestamp('last_sync_at'),
    syncStatus: varchar('sync_status', { length: 20 }).default('pending'),
});
