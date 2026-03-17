export interface IImpactService {
    getOverview(filters?: any): Promise<any>;
    getEmployeeImpact(employeeId: string): Promise<any>;
    getDepartmentImpact(department: string): Promise<any>;
}
