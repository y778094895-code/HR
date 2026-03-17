export interface ISalaryService {
    getSalaries(filters: any): Promise<any>;
    getSalaryById(id: string): Promise<any>;
    getEmployeeSalaryHistory(employeeId: string): Promise<any>;
    createSalary(data: any): Promise<any>;
    updateSalary(id: string, data: any): Promise<any>;
    deleteSalary(id: string): Promise<any>;
}
