import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { interventions } from '../models/interventions.schema';

@injectable()
export class InterventionRepository extends BaseRepository<typeof interventions> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, interventions);
    }

    async find(filters: any) {
        // Simple select for now, expand with filters as needed
        return this.db.select().from(this.table);
    }
}
