export interface IRecommendationService {
    getRecommendations(filters?: any): Promise<any[]>;
    getRecommendationById(id: string): Promise<any>;
    generateForEmployee(employeeId: string, focusArea?: string): Promise<any[]>;
    generateBatch(data: any): Promise<any>;
    acceptRecommendation(id: string): Promise<any>;
    rejectRecommendation(id: string, reason?: string): Promise<any>;
    applyRecommendation(id: string): Promise<any>;
}
