export interface IMLServiceClient {
    predictTurnover(employeeId: string, features?: any): Promise<any>;
    predictTurnoverBatch(employeeIds: string[]): Promise<any>;
    getRecommendations(employeeId: string, focusArea?: string): Promise<any>;
    analyzeFairness(department?: string): Promise<any>;
}
