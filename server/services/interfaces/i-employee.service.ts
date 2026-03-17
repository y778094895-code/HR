
import { EmployeeDto } from '../../shared/dtos/employee.dto';

export interface IEmployeeService {
    // Read operations
    getEmployees(filters?: any, pagination?: any): Promise<{ items: EmployeeDto[], total: number }>;
    getEmployeeById(id: string): Promise<EmployeeDto | null>;
    getEmployeePerformance(id: string): Promise<any>;

    // Write operations
    createEmployee(data: any): Promise<EmployeeDto>;
    updateEmployee(id: string, updates: any): Promise<EmployeeDto>;
    deleteEmployee(id: string): Promise<void>;
}
