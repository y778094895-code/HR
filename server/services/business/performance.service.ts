import { injectable, inject } from 'inversify';
import { IPerformanceService } from '../interfaces/i-performance.service';
import { PerformanceRepository } from '../../data/repositories/performance.repository';
import { db } from '../../data/database/connection';
import { perfAssessments, perfKpiScores } from '../../data/models/performance.schema';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { recommendations } from '../../data/models/interventions.schema';
import { hrDepartments } from '../../data/models/hr-master.schema';
import { sql, avg, desc, eq, and } from 'drizzle-orm';

@injectable()
export class PerformanceService implements IPerformanceService {
    constructor(
        @inject('PerformanceRepository') private performanceRepo: PerformanceRepository
    ) { }

    async getPerformanceOverview(filters?: any): Promise<any> {
        const [overall] = await db
            .select({ score: avg(perfAssessments.score) })
            .from(perfAssessments);

        const score = overall?.score ? parseFloat(Number(overall.score).toFixed(1)) : 0;

        // Since we don't have enough historical data yet, we provide standard KPIs based on current DB state.
        return {
            overallScore: score,
            kpis: [
                { id: '1', name: 'Productivity', value: score > 0 ? score / 5 : 0, status: 'good', trend: 0 },
                { id: '2', name: 'Quality', value: score > 0 ? (score / 5) * 0.9 : 0, status: 'good', trend: 0 },
                { id: '3', name: 'Timeliness', value: score > 0 ? (score / 5) * 0.8 : 0, status: 'warning', trend: 0 }
            ],
            trends: [
                { month: 'Current', score: score }
            ]
        };
    }

    async getEmployeesPerformance(filters?: any): Promise<any> {
        const result = await db.select({
            id: employeesLocal.id,
            name: employeesLocal.fullName,
            department: employeesLocal.department,
            role: employeesLocal.designation,
            status: employeesLocal.employmentStatus,
            performanceScore: perfAssessments.score
        })
            .from(employeesLocal)
            .leftJoin(perfAssessments, eq(employeesLocal.id, perfAssessments.employeeId))
            .limit(50);

        return {
            items: result,
            total: result.length,
            page: 1,
            pageSize: 50,
            totalPages: 1
        };
    }

    async getDepartmentsPerformance(): Promise<any[]> {
        const result = await db.select({
            departmentId: employeesLocal.departmentId,
            departmentName: employeesLocal.department,
            averageScore: avg(perfAssessments.score),
            employeeCount: sql<number>`count(distinct ${employeesLocal.id})`
        })
            .from(employeesLocal)
            .leftJoin(perfAssessments, eq(employeesLocal.id, perfAssessments.employeeId))
            .where(sql`${employeesLocal.department} IS NOT NULL`)
            .groupBy(employeesLocal.departmentId, employeesLocal.department);

        return result.map(row => ({
            departmentId: row.departmentId,
            departmentName: row.departmentName,
            averageScore: row.averageScore ? parseFloat(Number(row.averageScore).toFixed(2)) : 0,
            employeeCount: Number(row.employeeCount),
            topPerformer: { name: 'N/A', id: '' } // Needs window functions to resolve properly
        }));
    }

    async getPerformanceRecommendations(employeeId?: string): Promise<any[]> {
        let query = db.select()
            .from(recommendations)
            .where(eq(recommendations.recommendationType, 'performance'));

        if (employeeId) {
            query = db.select()
                .from(recommendations)
                .where(and(eq(recommendations.recommendationType, 'performance'), eq(recommendations.employeeId, employeeId)));
        }

        const recs = await query;
        return recs.map(r => ({
            id: r.id,
            employeeId: r.employeeId,
            type: r.recommendationType,
            title: r.title,
            description: r.description,
            impactScore: r.confidence ? parseFloat(Number(r.confidence).toString()) : 0
        }));
    }

    async getEmployeePerformanceDetail(employeeId: string): Promise<any> {
        const rawData = await this.getEmployeePerformance(employeeId);

        const [emp] = await db.select().from(employeesLocal).where(eq(employeesLocal.id, employeeId));

        return {
            employee: { id: employeeId, name: emp?.fullName || `Employee ${employeeId.substring(0, 5)}...` },
            score: rawData.currentRating || 0,
            history: rawData.assessments.map((a: any) => ({
                date: new Date(a.createdAt).toISOString().split('T')[0],
                score: parseFloat(a.score)
            })),
            strengths: ['Based on KPIs'],
            weaknesses: ['Needs Improvement'],
            recommendedTraining: []
        };
    }

    async getEmployeePerformance(employeeId: string) {
        const rawData = await this.performanceRepo.getEmployeePerformanceData(employeeId);

        return {
            assessments: rawData.assessments,
            goals: rawData.goals,
            currentRating: rawData.assessments.length > 0 ? parseFloat(rawData.assessments[0].score) : null
        };
    }
}
