import { injectable, inject } from 'inversify';
import { db } from '../../data/database/connection';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { perfAssessments } from '../../data/models/performance.schema';
import { turnoverRisk } from '../../data/models/turnover-risk.schema';
import { goals } from '../../data/models/goals.schema';
import { fairnessRuns, fairnessMetricValues } from '../../data/models/fairness-runs.schema';
import { sql, avg, count, eq, inArray, and, desc } from 'drizzle-orm';
import { redisGet, redisSet, redisDel } from '../../data/external/redis.client';
import { MLServiceClient } from '../../data/external/ml.service.client';

const DASHBOARD_TTL = 300; // 5 minutes
const dashKey = (role: string, scopeId: string) => `analytics:dashboard:${role}:${scopeId}`;
const deptKey = (deptId: string) => `analytics:dept:${deptId}`;

export type DashboardRole = 'employee' | 'manager' | 'hr' | 'admin';

@injectable()
export class AnalyticsService {
    constructor(
        @inject('MLServiceClient') private readonly mlService: MLServiceClient,
    ) { }

    /**
     * Role-scoped dashboard KPIs (T110).
     * Employee → own metrics; Manager → team metrics; HR/Admin → org-wide.
     */
    async getDashboard(userId: string, role: DashboardRole, employeeId?: string): Promise<any> {
        const scopeId = employeeId ?? userId;
        const cached = await redisGet(dashKey(role, scopeId));
        if (cached) {
            try { return JSON.parse(cached); } catch { /* corrupt — fall through */ }
        }

        let result: any;

        if (role === 'employee') {
            result = await this._employeeDashboard(scopeId);
        } else if (role === 'manager') {
            result = await this._managerDashboard(scopeId);
        } else {
            result = await this._orgDashboard(role === 'admin');
        }

        await redisSet(dashKey(role, scopeId), JSON.stringify(result), DASHBOARD_TTL);
        return result;
    }

    /** Department-level summary (T111). */
    async getDepartmentSummary(departmentId: string): Promise<any> {
        const cached = await redisGet(deptKey(departmentId));
        if (cached) {
            try { return JSON.parse(cached); } catch { /* fall through */ }
        }

        // Employees in department
        const [empRow] = await db
            .select({ count: count() })
            .from(employeesLocal)
            .where(and(
                eq(employeesLocal.employmentStatus, 'active'),
                eq(employeesLocal.departmentId, departmentId),
            ));

        // Avg goal completion in department
        const [goalRow] = await db
            .select({ avg: avg(goals.currentValue) })
            .from(goals)
            .leftJoin(employeesLocal, eq(goals.employeeId, employeesLocal.id))
            .where(eq(employeesLocal.departmentId, departmentId));

        // Avg review score (performance assessments)
        const [perfRow] = await db
            .select({ avg: avg(perfAssessments.score) })
            .from(perfAssessments)
            .leftJoin(employeesLocal, eq(perfAssessments.employeeId, employeesLocal.id))
            .where(eq(employeesLocal.departmentId, departmentId));

        // Risk band distribution
        const riskRows = await db
            .select({
                band: turnoverRisk.riskLevel,
                count: count(),
            })
            .from(turnoverRisk)
            .leftJoin(employeesLocal, eq(turnoverRisk.employeeId, employeesLocal.id))
            .where(eq(employeesLocal.departmentId, departmentId))
            .groupBy(turnoverRisk.riskLevel);

        const riskDistribution = Object.fromEntries(
            riskRows.map((r) => [r.band, Number(r.count)]),
        );

        const result = {
            departmentId,
            employeeCount: Number(empRow?.count ?? 0),
            avgGoalCompletion: goalRow?.avg ? parseFloat(Number(goalRow.avg).toFixed(2)) : null,
            avgReviewScore: perfRow?.avg ? parseFloat(Number(perfRow.avg).toFixed(2)) : null,
            riskDistribution,
        };

        await redisSet(deptKey(departmentId), JSON.stringify(result), DASHBOARD_TTL);
        return result;
    }

    /** Invalidate cached dashboard for a scope (e.g., on review lock or goal change). */
    async invalidateDashboard(role: DashboardRole, scopeId: string): Promise<void> {
        await redisDel(dashKey(role, scopeId));
    }

    // ── Fairness (T133) ───────────────────────────────────────────────────────

    /**
     * Call ML service `/fairness/report`, persist result in `fairness_runs`,
     * and return the stored run with metric values.
     */
    async generateFairnessReport(opts: {
        cycleId?: string;
        attribute: string;   // e.g. 'gender', 'department'
        createdBy?: string;
    }): Promise<any> {
        // Call ML fairness endpoint
        let mlResult: any = {};
        try {
            mlResult = await this.mlService.analyzeFairness(opts.attribute);
        } catch (e: any) {
            console.warn(`[AnalyticsService] ML fairness call failed: ${e.message}`);
        }

        // Persist run record
        const [run] = await db
            .insert(fairnessRuns)
            .values({
                notes: `Attribute: ${opts.attribute}${opts.cycleId ? ` | Cycle: ${opts.cycleId}` : ''}`,
                createdBy: opts.createdBy ?? null,
            })
            .returning();

        // Persist metric values (groups from ML result)
        const scores: any[] = mlResult?.scores ?? [];
        if (scores.length) {
            await db.insert(fairnessMetricValues).values(
                scores.map((s: any) => ({
                    runId: run.id,
                    metric: 'disparate_impact',
                    group: `${opts.attribute}:${s.attribute_value ?? s.group ?? 'unknown'}`,
                    value: String(s.score ?? s.di_score ?? 0),
                    thresholds: { min: 0.8, max: 1.25 },
                })),
            );
        }

        return { run, scores, attribute: opts.attribute, mlResult };
    }

    /** List all fairness run summaries (T134). */
    async listFairnessReports(): Promise<any[]> {
        return db.select().from(fairnessRuns).orderBy(desc(fairnessRuns.runDate)).limit(50);
    }

    /** Get a single fairness run with its metric values (T134). */
    async getFairnessReport(runId: string): Promise<any> {
        const [run] = await db
            .select()
            .from(fairnessRuns)
            .where(eq(fairnessRuns.id, runId));
        if (!run) return null;

        const metrics = await db
            .select()
            .from(fairnessMetricValues)
            .where(eq(fairnessMetricValues.runId, runId));

        return { ...run, metrics };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async _employeeDashboard(employeeId: string) {
        const [perfRow] = await db
            .select({ avg: avg(perfAssessments.score) })
            .from(perfAssessments)
            .where(eq(perfAssessments.employeeId, employeeId));

        const [riskRow] = await db
            .select({
                riskScore: turnoverRisk.riskScore,
                riskLevel: turnoverRisk.riskLevel,
            })
            .from(turnoverRisk)
            .where(eq(turnoverRisk.employeeId, employeeId))
            .orderBy(sql`${turnoverRisk.createdAt} desc`)
            .limit(1);

        const goalRows = await db
            .select({ status: goals.status, count: count() })
            .from(goals)
            .where(eq(goals.employeeId, employeeId))
            .groupBy(goals.status);

        return {
            scope: 'employee',
            performance: perfRow?.avg ? parseFloat(Number(perfRow.avg).toFixed(2)) : null,
            riskScore: riskRow?.riskScore ? parseFloat(riskRow.riskScore.toString()) : null,
            riskLevel: riskRow?.riskLevel ?? null,
            goals: Object.fromEntries(goalRows.map((g) => [g.status, Number(g.count)])),
        };
    }

    private async _managerDashboard(managerId: string) {
        // Direct reports
        const reports = await db
            .select({ id: employeesLocal.id })
            .from(employeesLocal)
            .where(and(
                eq(employeesLocal.managerId, managerId),
                eq(employeesLocal.employmentStatus, 'active'),
            ));
        const reportIds = reports.map((r) => r.id);

        if (!reportIds.length) {
            return { scope: 'manager', teamSize: 0, avgPerformance: null, highRiskCount: 0 };
        }

        const [perfRow] = await db
            .select({ avg: avg(perfAssessments.score) })
            .from(perfAssessments)
            .where(inArray(perfAssessments.employeeId, reportIds));

        const [riskRow] = await db
            .select({ count: count() })
            .from(turnoverRisk)
            .where(and(
                inArray(turnoverRisk.employeeId, reportIds),
                inArray(turnoverRisk.riskLevel, ['high', 'critical']),
            ));

        return {
            scope: 'manager',
            teamSize: reportIds.length,
            avgPerformance: perfRow?.avg ? parseFloat(Number(perfRow.avg).toFixed(2)) : null,
            highRiskCount: Number(riskRow?.count ?? 0),
        };
    }

    private async _orgDashboard(includeSystemStats: boolean) {
        const [empRow] = await db
            .select({ count: count() })
            .from(employeesLocal)
            .where(eq(employeesLocal.employmentStatus, 'active'));

        const [perfRow] = await db.select({ avg: avg(perfAssessments.score) }).from(perfAssessments);

        const [riskRow] = await db
            .select({ count: count() })
            .from(turnoverRisk)
            .where(inArray(turnoverRisk.riskLevel, ['high', 'critical']));

        const riskBands = await db
            .select({ band: turnoverRisk.riskLevel, count: count() })
            .from(turnoverRisk)
            .groupBy(turnoverRisk.riskLevel);

        return {
            scope: includeSystemStats ? 'admin' : 'hr',
            totalEmployees: Number(empRow?.count ?? 0),
            avgPerformance: perfRow?.avg ? parseFloat(Number(perfRow.avg).toFixed(2)) : null,
            highRiskCount: Number(riskRow?.count ?? 0),
            riskBandDistribution: Object.fromEntries(
                riskBands.map((r) => [r.band, Number(r.count)]),
            ),
        };
    }
}
