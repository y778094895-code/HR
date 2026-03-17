export interface IPerformanceService {
    getPerformanceOverview(filters?: any): Promise<any>;
    getEmployeesPerformance(filters?: any): Promise<any>;
    getDepartmentsPerformance(): Promise<any[]>;
    getPerformanceRecommendations(employeeId?: string): Promise<any[]>;
    getEmployeePerformanceDetail(employeeId: string): Promise<any>;
    // Legacy mapping support:
    getEmployeePerformance(employeeId: string): Promise<any>;
}
