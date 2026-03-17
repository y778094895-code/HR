import { injectable } from 'inversify';
import { db } from '../../data/database/connection';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { perfAssessments } from '../../data/models/performance.schema';
import { turnoverRisk } from '../../data/models/turnover-risk.schema';
import { interventions } from '../../data/models/interventions.schema';
import { sql, avg, count, eq, inArray } from 'drizzle-orm';

@injectable()
export class DashboardService {
    async getStats() {
        // Total Employees
        const [empResult] = await db
            .select({ count: count() })
            .from(employeesLocal)
            .where(eq(employeesLocal.employmentStatus, 'active'));
        const totalEmployees = empResult?.count || 0;

        // Avg Performance
        const [perfResult] = await db
            .select({ average: avg(perfAssessments.score) })
            .from(perfAssessments);
        const avgPerformance = perfResult?.average ? parseFloat(Number(perfResult.average).toFixed(1)) : 0;

        // Turnover Risk (High/Critical)
        const [riskResult] = await db
            .select({ count: count() })
            .from(turnoverRisk)
            .where(inArray(turnoverRisk.riskLevel, ['high', 'critical']));
        const highRetentionRisk = riskResult?.count || 0;

        // Active Interventions
        const [intResult] = await db
            .select({ count: count() })
            .from(interventions)
            .where(eq(interventions.status, 'in_progress'));
        const activeInterventions = intResult?.count || 0;

        const kpis = [
            {
                id: 'total-employees',
                title: 'Total Employees',
                value: totalEmployees,
                trend: 'up',
                is_positive: true,
                change_percentage: 2
            },
            {
                id: 'avg-performance',
                title: 'Avg Performance',
                value: avgPerformance,
                trend: 'up',
                is_positive: true,
                change_percentage: 1.5
            },
            {
                id: 'turnover-risk',
                title: 'High Retention Risk',
                value: highRetentionRisk,
                trend: highRetentionRisk > 20 ? 'up' : 'down',
                is_positive: highRetentionRisk <= 20,
                change_percentage: 0
            },
            {
                id: 'active-interventions',
                title: 'Active Interventions',
                value: activeInterventions,
                trend: 'neutral',
                is_positive: true,
                change_percentage: 0
            }
        ];

        // Basic Trends (just a placeholder utilizing current count to avoid hardcoded full array if DB is empty)
        // Ideally aggregate by month from DB, but keeping it simple for now as requested.
        const trends = [
            { name: '3 Months Ago', value: Math.max(0, totalEmployees - 30), change: 10 },
            { name: '2 Months Ago', value: Math.max(0, totalEmployees - 20), change: 10 },
            { name: 'Last Month', value: Math.max(0, totalEmployees - 10), change: 10 },
            { name: 'Current', value: totalEmployees, change: 10 }
        ];

        return {
            kpis,
            trends
        };
    }
}
