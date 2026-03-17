import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { salarySnapshots } from '../models/salary.schema';
import { employeesLocal } from '../models/employees-local.schema';
import { eq, desc, and, sql, like, between } from 'drizzle-orm';

@injectable()
export class SalaryRepository extends BaseRepository<typeof salarySnapshots> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, salarySnapshots);
    }

    async findByEmployee(employeeId: string, limit = 12) {
        return this.db.select()
            .from(salarySnapshots)
            .where(eq(salarySnapshots.employeeId, employeeId))
            .orderBy(desc(salarySnapshots.salaryMonth))
            .limit(limit);
    }

    async findWithEmployee(filters: {
        page?: number;
        pageSize?: number;
        search?: string;
        department?: string;
        paymentStatus?: string;
        salaryMonth?: string;
    }) {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;

        let conditions: any[] = [];

        if (filters.paymentStatus) {
            conditions.push(eq(salarySnapshots.paymentStatus, filters.paymentStatus));
        }
        if (filters.salaryMonth) {
            conditions.push(eq(salarySnapshots.salaryMonth, filters.salaryMonth));
        }
        if (filters.department) {
            conditions.push(eq(employeesLocal.department, filters.department));
        }
        if (filters.search) {
            conditions.push(like(employeesLocal.fullName, `%${filters.search}%`));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const items = await this.db.select({
            id: salarySnapshots.id,
            employeeId: salarySnapshots.employeeId,
            employeeName: employeesLocal.fullName,
            department: employeesLocal.department,
            salaryMonth: salarySnapshots.salaryMonth,
            basicSalary: salarySnapshots.basicSalary,
            paymentStatus: salarySnapshots.paymentStatus,
            paymentDate: salarySnapshots.paymentDate,
            createdAt: salarySnapshots.createdAt,
        })
            .from(salarySnapshots)
            .leftJoin(employeesLocal, eq(salarySnapshots.employeeId, employeesLocal.id))
            .where(whereClause)
            .orderBy(desc(salarySnapshots.salaryMonth))
            .limit(pageSize)
            .offset(offset);

        const [countResult] = await this.db.select({
            count: sql<number>`count(*)`,
        })
            .from(salarySnapshots)
            .leftJoin(employeesLocal, eq(salarySnapshots.employeeId, employeesLocal.id))
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

    async findByEmployeeAndMonth(employeeId: string, salaryMonth: string) {
        const [result] = await this.db.select()
            .from(salarySnapshots)
            .where(and(
                eq(salarySnapshots.employeeId, employeeId),
                eq(salarySnapshots.salaryMonth, salaryMonth)
            ));
        return result || null;
    }
}
