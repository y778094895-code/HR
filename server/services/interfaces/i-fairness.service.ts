import { FairnessEntity } from '../domain/fairness.entity';

export interface IFairnessService {
    // Read operations
    getAll(filters?: any): Promise<FairnessEntity[]>;
    getById(id: string): Promise<FairnessEntity>;

    // New API Endpoints
    getMetrics(filters?: any): Promise<any[]>;
    getComparison(groupBy: string): Promise<any>;
    getRecommendations(): Promise<any[]>;
    analyzeDepartment(departmentId: string): Promise<any[]>;
    getMatrix(): Promise<any>;
    getGapAnalysis(): Promise<any>;

    // Business operations
    calculateDisparateImpact(groupA: string, groupB: string): Promise<number>;
}
