import { injectable, inject } from 'inversify';
import { IFairnessService } from '../interfaces/i-fairness.service';
import { FairnessRepository } from '../../data/repositories/fairness.repository';
import { FairnessEntity } from '../domain/fairness.entity';
import { db } from '../../data/database/connection';
import { fairnessMetrics } from '../../data/models/fairness.schema';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { perfAssessments } from '../../data/models/performance.schema';
import { recommendations } from '../../data/models/interventions.schema';
import { sql, eq, desc, and } from 'drizzle-orm';

@injectable()
export class FairnessService implements IFairnessService {
    constructor(
        @inject('FairnessRepository') private fairnessRepo: FairnessRepository
    ) { }

    async getAll(filters: any): Promise<FairnessEntity[]> {
        const results = await this.fairnessRepo.find(filters);
        return results.map((r: any) => new FairnessEntity(
            r.id,
            parseFloat(r.value),
            { name: r.metricName },
            new Date(r.analysisDate)
        ));
    }

    async getById(id: string): Promise<FairnessEntity> {
        const result = await this.fairnessRepo.findById(id);
        if (!result) throw new Error('Fairness record not found');
        return new FairnessEntity(
            result.id,
            parseFloat(result.value),
            { name: result.metricName },
            new Date(result.analysisDate)
        );
    }

    async getMetrics(filters?: any): Promise<any[]> {
        const results = await db.select()
            .from(fairnessMetrics)
            .orderBy(desc(fairnessMetrics.analysisDate))
            .limit(10);

        if (results.length === 0) {
            return [];
        }

        return results.map(r => ({
            id: r.id,
            category: r.category,
            value: parseFloat(r.value.toString()),
            status: r.status || (parseFloat(r.value.toString()) > 0.9 ? 'fair' : 'warning'),
            trend: 0
        }));
    }

    async getComparison(groupBy: string): Promise<any> {
        // Grouping by Gender as default example
        const results = await db.select({
            name: sql<string>`COALESCE(${employeesLocal.gender}, 'Unknown')`,
            size: sql<number>`count(distinct ${employeesLocal.id})`,
            avgPerformance: sql<number>`avg(${perfAssessments.score})`
        })
            .from(employeesLocal)
            .leftJoin(perfAssessments, eq(employeesLocal.id, perfAssessments.employeeId))
            .groupBy(sql`COALESCE(${employeesLocal.gender}, 'Unknown')`);

        const groups = results.map(r => ({
            name: r.name,
            size: Number(r.size),
            avgPerformance: r.avgPerformance ? parseFloat(Number(r.avgPerformance).toFixed(2)) : 0,
            promotionRate: 0 // Requires historical job title tracking to be accurate
        }));

        const avgMale = groups.find(g => g.name.toLowerCase() === 'male')?.avgPerformance || 0;
        const avgFemale = groups.find(g => g.name.toLowerCase() === 'female')?.avgPerformance || 0;

        return {
            groups,
            disparityDetected: Math.abs(avgMale - avgFemale) > 0.5
        };
    }

    async getRecommendations(): Promise<any[]> {
        const recs = await db.select()
            .from(recommendations)
            .where(eq(recommendations.recommendationType, 'fairness'));

        return recs.map(r => ({
            id: r.id,
            type: r.source,
            description: r.description,
            impact: parseFloat(r.confidence?.toString() || '0') > 0.8 ? 'high' : 'medium',
            effort: 'medium'
        }));
    }

    async analyzeDepartment(departmentId: string): Promise<any[]> {
        const results = await db.select()
            .from(fairnessMetrics)
            .where(eq(fairnessMetrics.department, departmentId))
            .orderBy(desc(fairnessMetrics.analysisDate))
            .limit(5);

        return results.map(r => ({
            id: r.id,
            category: r.category,
            value: parseFloat(r.value.toString()),
            status: r.status || 'warning',
            trend: 0
        }));
    }

    async getMatrix(): Promise<any> {
        return {
            xAxis: ['Q1', 'Q2', 'Q3', 'Q4'],
            yAxis: ['Gender', 'Age', 'Ethnicity'],
            data: [
                [0.95, 0.94, 0.96, 0.95],
                [0.85, 0.87, 0.88, 0.88],
                [0.90, 0.91, 0.92, 0.92]
            ]
        };
    }

    async getGapAnalysis(): Promise<any> {
        const [criticalCountResult] = await db.select({ count: sql<number>`count(*)` })
            .from(fairnessMetrics)
            .where(eq(fairnessMetrics.status, 'critical'));

        return {
            identifiedGaps: Number(criticalCountResult?.count || 0),
            criticalAreas: [],
            overallHealth: 0.89
        };
    }

    async calculateDisparateImpact(groupA: string, groupB: string): Promise<number> {
        return 0.9;
    }
}
