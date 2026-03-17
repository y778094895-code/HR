import { pgTable, uuid, varchar, date, decimal, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';

/**
 * Salary snapshots table — stores monthly salary records per employee.
 * Source of truth: ARCHITECTURE.md salary_snapshots specification.
 *
 * Extension points:
 * - Generated columns (total_allowances, total_deductions, net_salary, total_earnings)
 *   are computed in the service layer rather than DB-level GENERATED ALWAYS AS,
 *   because Drizzle ORM does not support computed columns natively.
 * - Payroll integrations can populate via batch import.
 */
export const salarySnapshots = pgTable('salary_snapshots', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    salaryMonth: date('salary_month').notNull(),
    salaryStructure: varchar('salary_structure', { length: 100 }),

    // Earnings
    basicSalary: decimal('basic_salary', { precision: 12, scale: 2 }).notNull(),
    houseRentAllowance: decimal('house_rent_allowance', { precision: 12, scale: 2 }).default('0'),
    conveyanceAllowance: decimal('conveyance_allowance', { precision: 12, scale: 2 }).default('0'),
    medicalAllowance: decimal('medical_allowance', { precision: 12, scale: 2 }).default('0'),
    specialAllowance: decimal('special_allowance', { precision: 12, scale: 2 }).default('0'),
    otherAllowances: decimal('other_allowances', { precision: 12, scale: 2 }).default('0'),

    // Deductions
    professionalTax: decimal('professional_tax', { precision: 12, scale: 2 }).default('0'),
    providentFund: decimal('provident_fund', { precision: 12, scale: 2 }).default('0'),
    incomeTax: decimal('income_tax', { precision: 12, scale: 2 }).default('0'),
    otherDeductions: decimal('other_deductions', { precision: 12, scale: 2 }).default('0'),

    // Extras
    bonus: decimal('bonus', { precision: 12, scale: 2 }).default('0'),
    overtimePay: decimal('overtime_pay', { precision: 12, scale: 2 }).default('0'),
    incentives: decimal('incentives', { precision: 12, scale: 2 }).default('0'),

    // Payment
    paymentDate: date('payment_date'),
    paymentStatus: varchar('payment_status', { length: 50 }).default('pending'), // pending, processed, paid, failed
    paymentReference: varchar('payment_reference', { length: 100 }),
    remarks: text('remarks'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    employeeMonthIdx: uniqueIndex('salary_employee_month_idx').on(t.employeeId, t.salaryMonth),
}));

export type SalarySnapshot = typeof salarySnapshots.$inferSelect;
export type NewSalarySnapshot = typeof salarySnapshots.$inferInsert;
