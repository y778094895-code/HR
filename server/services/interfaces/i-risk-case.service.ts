export interface IRiskCaseService {
    getCasesByEmployee(employeeId: string): Promise<any[]>;
    createCase(employeeId: string, data: any): Promise<any>;
    updateCase(id: string, updates: any): Promise<any>;
}
