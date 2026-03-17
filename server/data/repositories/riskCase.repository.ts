import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { riskCases } from '../models/risk.schema';
import { eq } from 'drizzle-orm';

@injectable()
export class RiskCaseRepository extends BaseRepository<typeof riskCases> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, riskCases);
    }

    async findByEmployee(employeeId: string) {
        return this.db.select().from(this.table).where(eq(this.table.employeeId, employeeId));
    }

    async createCase(data: any) {
        const result = await this.db.insert(this.table).values(data).returning();
        return result[0];
    }
}
