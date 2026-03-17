export interface ITrainingService {
    getSkillGaps(employeeId: string): Promise<any[]>;
    getRecommendations(filters?: any): Promise<any[]>;
    approveRecommendation(id: string): Promise<void>;
    rejectRecommendation(id: string, reason?: string): Promise<void>;
    getTrainingEffectiveness(programId?: string): Promise<any[]>;
}
