export interface IMLServiceClient {
    predictTurnover(employeeId: string, features?: any): Promise<any>;
    predictTurnoverBatch(employeeIds: string[]): Promise<any>;
    requestBatchPrediction(opts: { batchId: string; departmentId?: string; staleOnly?: boolean }): Promise<void>;
    getRecommendations(employeeId: string, focusArea?: string): Promise<any>;
    analyzeFairness(department?: string): Promise<any>;
}
