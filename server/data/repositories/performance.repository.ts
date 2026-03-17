import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { perfAssessments, employeeGoals } from '../models/index';
import { eq, desc } from 'drizzle-orm';

@injectable()
export class PerformanceRepository extends BaseRepository<typeof perfAssessments> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, perfAssessments);
    }

    async getEmployeePerformanceData(employeeId: string) {
        const db = (this as any).db;

        // Fetch recent assessments
        const assessments = await db.select()
            .from(perfAssessments)
            .where(eq(perfAssessments.employeeId, employeeId))
            .orderBy(desc(perfAssessments.createdAt))
            .limit(5);

        // Fetch active goals
        const goals = await db.select()
            .from(employeeGoals)
            .where(eq(employeeGoals.employeeId, employeeId))
            .orderBy(desc(employeeGoals.createdAt));

        return {
            assessments,
            goals
        };
    }
}
