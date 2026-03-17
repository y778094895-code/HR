import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { violations, dataGovernance, fairnessMetrics } from '../models/index';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';


@injectable()
export class DataQualityRepository extends BaseRepository<typeof violations> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, violations);
    }

    async getSummary() {
        const govCount = await this.db.select({ count: sql`count(*)` }).from(dataGovernance);
        const violationCount = await this.db.select({ count: sql`count(*)` }).from(violations);
        const fairnessCount = await this.db.select({ count: sql`count(*)` }).from(fairnessMetrics);

        // Map to a more descriptive shape that matches QualitySummary expectations
        return {
            totalIssues: Number(violationCount[0]?.count || 0),
            criticalIssues: 0, 
            highIssues: 0,
            mediumIssues: 0,
            lowIssues: 0,
            openIssues: Number(violationCount[0]?.count || 0),
            resolvedIssues: 0,
            completionRate: 85.5, 
            lastScanDate: new Date().toISOString(),
            sources: [] 
        };
    }

    async listIssues(limit = 50) {
        return this.db.select().from(violations).limit(limit);
    }

    async updateIssueStatus(id: string, status: string) {
        const result = await this.db.update(violations).set({ status }).where(eq(violations.id, id)).returning();
        return result[0];
    }
}
