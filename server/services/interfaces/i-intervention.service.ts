import { InterventionEntity } from '../domain/intervention.entity';

export interface IInterventionService {
    // Read operations
    getAll(filters?: any): Promise<InterventionEntity[]>;
    getById(id: string): Promise<InterventionEntity>;

    // Write operations
    create(data: any): Promise<InterventionEntity>;
    update(id: string, data: any): Promise<InterventionEntity>;

    // Detailed operations
    getInterventions(filters?: any): Promise<any>;
    getInterventionDetail(id: string): Promise<any>;
    createIntervention(data: any): Promise<any>;
    updateStatus(id: string, status: string): Promise<void>;
    logAction(id: string, action: string, notes?: string): Promise<void>;
    getHistory(id: string): Promise<any[]>;
    assign(id: string, ownerId: string): Promise<void>;
    close(id: string, notes?: string): Promise<void>;

    // Analytics & Recommendations
    getAnalytics(): Promise<any>;
    getRecommendations(): Promise<any[]>;
    handleRecommendationAction(id: string, action: 'accept' | 'reject' | 'apply'): Promise<void>;
}
