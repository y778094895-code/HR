import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { trainingNeedPredictions } from '../models/training.schema';

@injectable()
export class TrainingRepository extends BaseRepository<typeof trainingNeedPredictions> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, trainingNeedPredictions);
    }
}
