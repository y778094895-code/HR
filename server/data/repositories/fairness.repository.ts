import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { fairnessMetrics } from '../models/fairness.schema';

@injectable()
export class FairnessRepository extends BaseRepository<typeof fairnessMetrics> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, fairnessMetrics);
    }

    async find(filters: any) {
        // Simple select for now, expand with filters as needed
        return this.db.select().from(this.table);
    }
}
