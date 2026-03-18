import { injectable, inject } from 'inversify';
import { MLServiceClient } from '../../data/external/ml.service.client';
import { TurnoverRepository } from '../../data/repositories/turnover.repository';
import { XaiService } from './xai.service';
import { db } from '../../data/database/connection';
import { turnoverRisk } from '../../data/models/turnover-risk.schema';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { sql, inArray, eq, desc } from 'drizzle-orm';
import { redisGet, redisSet, redisDel } from '../../data/external/redis.client';

const RISK_CACHE_TTL = 900; // 15 minutes
const riskKey = (employeeId: string) => `risk:employee:${employeeId}`;

@injectable()
export class TurnoverService {
    constructor(
        @inject('MLServiceClient') private mlService: MLServiceClient,
        @inject('TurnoverRepository') private turnoverRepo: TurnoverRepository,
        @inject(XaiService) private xaiService: XaiService,
    ) { }

    async getMetrics(): Promise<any> {
        // High risk count
        const [highRiskResult] = await db.select({ count: sql<number>`count(*)` })
            .from(turnoverRisk)
            .where(inArray(turnoverRisk.riskLevel, ['high', 'critical']));

        const highRiskCount = Number(highRiskResult?.count || 0);

        // Total predictions
        const [totalPredictionsResult] = await db.select({ count: sql<number>`count(*)` })
            .from(turnoverRisk);

        const predictionsCount = Number(totalPredictionsResult?.count || 0);

        // Total Employees
        const [empResult] = await db.select({ count: sql<number>`count(*)` })
            .from(employeesLocal)
            .where(eq(employeesLocal.employmentStatus, 'active'));

        const totalEmployees = Number(empResult?.count || 1); // avoid div by 0

        const riskRate = totalEmployees > 0 ? (highRiskCount / totalEmployees) : 0;

        return {
            riskRate: parseFloat(riskRate.toFixed(2)),
            highRiskCount: highRiskCount,
            predictionsCount: predictionsCount,
            kpis: [
                { id: '1', name: 'Voluntary Turnover', value: riskRate, status: riskRate > 0.15 ? 'warning' : 'good', trend: 0 },
                { id: '2', name: 'Retention Rate', value: 1 - riskRate, status: (1 - riskRate) > 0.85 ? 'good' : 'warning', trend: 0 }
            ]
        };
    }

    async getRiskList(filters?: any): Promise<any> {
        // Build a proper query instead of pure repo to join employee details
        const results = await db.select({
            id: turnoverRisk.id,
            employeeId: turnoverRisk.employeeId,
            riskScore: turnoverRisk.riskScore,
            riskLevel: turnoverRisk.riskLevel,
            confidenceScore: turnoverRisk.confidenceScore,
            createdAt: turnoverRisk.createdAt,
            contributingFactors: turnoverRisk.contributingFactors,
            predictionDate: turnoverRisk.predictionDate,
            predictionValidUntil: turnoverRisk.predictionValidUntil,
            mlModelVersion: turnoverRisk.mlModelVersion,
            employeeName: employeesLocal.fullName,
            department: employeesLocal.department
        })
            .from(turnoverRisk)
            .leftJoin(employeesLocal, eq(turnoverRisk.employeeId, employeesLocal.id))
            .orderBy(desc(turnoverRisk.riskScore))
            .limit(50);

        return {
            items: results,
            total: results.length,
            page: 1,
            pageSize: 50,
            totalPages: 1
        };
    }

    async getRiskDetail(employeeId: string): Promise<any> {
        const latestRisk = await this.turnoverRepo.getLatestRiskForEmployee(employeeId);

        if (!latestRisk) {
            return {
                id: 'not-found',
                employeeId,
                riskScore: 0,
                riskLevel: 'unknown',
                confidenceScore: 0,
                contributingFactors: [],
                history: [],
                xai_explanation: { featureImportance: {} }
            };
        }

        const historyQuery = await db.select({
            date: turnoverRisk.predictionDate,
            score: turnoverRisk.riskScore
        })
            .from(turnoverRisk)
            .where(eq(turnoverRisk.employeeId, employeeId))
            .orderBy(desc(turnoverRisk.predictionDate))
            .limit(5);

        // Enrich contributing factors with locale-aware labels (T136)
        const rawFactors: Record<string, number> =
            latestRisk.contributingFactors && typeof latestRisk.contributingFactors === 'object'
                ? (latestRisk.contributingFactors as any).factors ?? latestRisk.contributingFactors
                : {};

        const features = this.xaiService.enrichFeatures(rawFactors);

        return {
            ...latestRisk,
            history: historyQuery.map(h => ({
                date: new Date(h.date || new Date()).toISOString().split('T')[0],
                score: parseFloat(h.score.toString())
            })),
            features,
            xai_explanation: {
                featureImportance: rawFactors,
                sentences_en: this.xaiService.toSentences(rawFactors, 'en'),
                sentences_ar: this.xaiService.toSentences(rawFactors, 'ar'),
            }
        };
    }

    async predictTurnover(employeeId: string): Promise<any> {
        // ── Cache check ──────────────────────────────────────────────────────
        const cached = await redisGet(riskKey(employeeId));
        if (cached) {
            try { return JSON.parse(cached); } catch { /* corrupt cache — fall through */ }
        }

        // ── ML call with 450 ms latency budget (T076) ────────────────────────
        let predictionValue = 0.5;
        let factors: Record<string, any> = {};

        const mlStart = Date.now();
        try {
            const predictionObj = await this.mlService.predictTurnover(employeeId);
            predictionValue = predictionObj.riskScore ?? 0.5;
            factors = predictionObj.factors || {};

            // If ML call exceeded budget, log but still use result
            if (Date.now() - mlStart > 450) {
                console.warn(`[TurnoverService] ML latency exceeded 450 ms for ${employeeId} (${Date.now() - mlStart} ms)`);
            }
        } catch (e) {
            console.warn(`[TurnoverService] MLService failed for ${employeeId}, using fallback`);
            predictionValue = 0.25;
            factors = { 'Historical Average': 0.25 };
        }

        const riskLevel = predictionValue > 0.7 ? 'critical' : predictionValue > 0.5 ? 'high' : predictionValue > 0.3 ? 'medium' : 'low';

        const record = await this.turnoverRepo.create({
            employeeId,
            riskScore: predictionValue,
            riskLevel,
            confidenceScore: 0.85,
            contributingFactors: { factors },
            mlModelVersion: 'v1.0'
        });

        // ── Cache write ──────────────────────────────────────────────────────
        await redisSet(riskKey(employeeId), JSON.stringify(record), RISK_CACHE_TTL);

        return record;
    }

    /** Invalidate cached risk score when employee data changes. */
    async invalidateCache(employeeId: string): Promise<void> {
        await redisDel(riskKey(employeeId));
    }

    /**
     * Trigger batch risk re-scoring.
     * Publishes a batch job to the ML service (async via queue or direct call).
     * Returns a summary; actual results arrive asynchronously.
     */
    async triggerBatchPrediction(opts: { departmentId?: string; staleOnly?: boolean }): Promise<{
        batchId: string;
        employeeCount: number;
        message: string;
    }> {
        const batchId = require('uuid').v4();

        // Count employees to process
        let query = db.select({ count: sql<number>`count(*)` }).from(employeesLocal);
        // NOTE: departmentId / staleOnly filters can be added here when schema supports them

        const [{ count }] = await query;
        const employeeCount = Number(count);

        // Delegate to ML service batch endpoint (fire-and-forget)
        try {
            await this.mlService.requestBatchPrediction({ batchId, departmentId: opts.departmentId, staleOnly: opts.staleOnly });
        } catch {
            // Log but don't fail — batch is best-effort
        }

        return { batchId, employeeCount, message: 'Batch prediction queued' };
    }
}
