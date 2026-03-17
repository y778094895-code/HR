import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { reportDefinitions, reportRuns, reportOutputs } from '../models/alerts-reports.schema';
import { eq, desc } from 'drizzle-orm';
import type { ReportDefinition, ReportRun, ReportOutput, NewReportRun } from '../models/alerts-reports.schema';

@injectable()
export class ReportsRepository extends BaseRepository<typeof reportRuns> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, reportRuns);
    }

    async getTemplates() {
        return this.db.select().from(reportDefinitions).orderBy(reportDefinitions.name);
    }

    async createRun(data: NewReportRun) {
        const [run] = await this.db.insert(reportRuns).values(data).returning();
        return run;
    }

    async getRunWithLatestOutput(runId: string) {
        const results = await this.db
            .select({
                run: reportRuns,
                output: reportOutputs
            })
            .from(reportRuns)
            .where(eq(reportRuns.id, runId))
            .leftJoin(reportOutputs, eq(reportRuns.id, reportOutputs.runId))
            .orderBy(desc(reportOutputs.generatedAt ?? reportRuns.startedAt))
            .limit(1);

        return results[0] || null;
    }

    async updateRunStatus(runId: string, status: string, finishedAt?: Date) {
        const updates: any = { status };
        if (finishedAt) updates.finishedAt = finishedAt;
        const [run] = await this.db
            .update(reportRuns)
            .set(updates)
            .where(eq(reportRuns.id, runId))
            .returning();
        return run;
    }

    async createOutput(runId: string, format: string = 'json', objectKey: string, periodStart?: string, periodEnd?: string) {
        const [output] = await this.db
            .insert(reportOutputs)
            .values({
                runId,
                format,
                objectKey,
                periodStart,
                periodEnd,
                status: 'available'
            })
            .returning();
        return output;
    }
}
