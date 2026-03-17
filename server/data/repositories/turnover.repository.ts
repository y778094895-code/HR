import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { turnoverRisk } from '../models/turnover-risk.schema';
import { eq, desc } from 'drizzle-orm';

@injectable()
export class TurnoverRepository extends BaseRepository<typeof turnoverRisk> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, turnoverRisk);
    }

    async getLatestRiskForEmployee(employeeId: string) {
        const db = (this as any).db;
        return db.select()
            .from(turnoverRisk)
            .where(eq(turnoverRisk.employeeId, employeeId))
            .orderBy(desc(turnoverRisk.createdAt))
            .limit(1)
            .then((res: any) => res[0]);
    }
}
