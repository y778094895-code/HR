import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { recommendations } from '../models/index';
import { eq, desc } from 'drizzle-orm';

@injectable()
export class RecommendationRepository extends BaseRepository<typeof recommendations> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, recommendations);
    }

async getEmployeeRecommendations(employeeId: string) {
        const results = await this.db.select()
            .from(recommendations)
            .where(eq(recommendations.employeeId, employeeId))
            .orderBy(desc(recommendations.createdAt));
        return results || [];
    }
}
