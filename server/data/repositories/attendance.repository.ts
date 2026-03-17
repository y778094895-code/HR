import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { hrAttendance } from '../models/attendance.schema';
import { employeesLocal } from '../models/employees-local.schema';
import { eq, desc, and, sql, like, between } from 'drizzle-orm';

@injectable()
export class AttendanceRepository extends BaseRepository<typeof hrAttendance> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, hrAttendance);
    }

    async findByEmployee(employeeId: string, limit = 30) {
        return this.db.select()
            .from(hrAttendance)
            .where(eq(hrAttendance.employeeId, employeeId))
            .orderBy(desc(hrAttendance.date))
            .limit(limit);
    }

    async findWithEmployee(filters: {
        page?: number;
        pageSize?: number;
        search?: string;
        department?: string;
        dateFrom?: string;
        dateTo?: string;
        absenceType?: string;
    }) {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;

        let conditions: any[] = [];

        if (filters.absenceType) {
            conditions.push(eq(hrAttendance.absenceType, filters.absenceType));
        }
        if (filters.dateFrom && filters.dateTo) {
            conditions.push(between(hrAttendance.date, filters.dateFrom, filters.dateTo));
        } else if (filters.dateFrom) {
            conditions.push(sql`${hrAttendance.date} >= ${filters.dateFrom}`);
        } else if (filters.dateTo) {
            conditions.push(sql`${hrAttendance.date} <= ${filters.dateTo}`);
        }
        if (filters.department) {
            conditions.push(eq(employeesLocal.department, filters.department));
        }
        if (filters.search) {
            conditions.push(like(employeesLocal.fullName, `%${filters.search}%`));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const items = await this.db.select({
            id: hrAttendance.id,
            employeeId: hrAttendance.employeeId,
            employeeName: employeesLocal.fullName,
            department: employeesLocal.department,
            date: hrAttendance.date,
            checkIn: hrAttendance.checkIn,
            checkOut: hrAttendance.checkOut,
            workMinutes: hrAttendance.workMinutes,
            absenceType: hrAttendance.absenceType,
            reason: hrAttendance.reason,
            source: hrAttendance.source,
            createdAt: hrAttendance.createdAt,
        })
            .from(hrAttendance)
            .leftJoin(employeesLocal, eq(hrAttendance.employeeId, employeesLocal.id))
            .where(whereClause)
            .orderBy(desc(hrAttendance.date))
            .limit(pageSize)
            .offset(offset);

        const [countResult] = await this.db.select({
            count: sql<number>`count(*)`,
        })
            .from(hrAttendance)
            .leftJoin(employeesLocal, eq(hrAttendance.employeeId, employeesLocal.id))
            .where(whereClause);

        const total = Number(countResult?.count ?? 0);

        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async findByEmployeeAndDate(employeeId: string, date: string) {
        const [result] = await this.db.select()
            .from(hrAttendance)
            .where(and(
                eq(hrAttendance.employeeId, employeeId),
                eq(hrAttendance.date, date)
            ));
        return result || null;
    }
}
