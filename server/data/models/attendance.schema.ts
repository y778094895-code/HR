import { pgTable, uuid, varchar, date, timestamp, integer, time, uniqueIndex } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';

export const hrAttendance = pgTable('hr_attendance', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    date: date('date').notNull(),
    checkIn: time('check_in'),
    checkOut: time('check_out'),
    workMinutes: integer('work_minutes'),
    absenceType: varchar('absence_type', { length: 50 }), // e.g., 'sick', 'vacation', 'unpaid'
    reason: varchar('reason', { length: 255 }),
    source: varchar('source', { length: 50 }).default('manual'), // 'biometric', 'manual', 'system'
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    employeeDateIdx: uniqueIndex('hr_attendance_employee_date_idx').on(t.employeeId, t.date),
}));

export type HrAttendance = typeof hrAttendance.$inferSelect;
export type NewHrAttendance = typeof hrAttendance.$inferInsert;
