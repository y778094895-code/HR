import { injectable, inject } from 'inversify';
import { IEmployeeService } from '../interfaces/i-employee.service';
import { IPerformanceService } from '../interfaces/i-performance.service';
import { EmployeeDto, mapEmployeeToDto } from '../../shared/dtos/employee.dto';
import { EmployeeRepository } from '../../data/repositories/employee.repository';
import { MLServiceClient } from '../../data/external/ml.service.client';
import { db } from '../../data/database/connection';
import { employeesLocal as employees } from '../../data/models/employees-local.schema';
import { outbox } from '../../data/models/outbox.schema';
import { EmployeeValidationRules, EmployeeBusinessRules } from '../rules/employee.rules';

@injectable()
export class EmployeeService implements IEmployeeService {
    constructor(
        @inject('EmployeeRepository') private employeeRepo: EmployeeRepository,
        @inject('MLServiceClient') private mlService: MLServiceClient,
        @inject('IPerformanceService') private performanceService: IPerformanceService
    ) { }

    async getEmployeePerformance(id: string): Promise<any> {
        return this.performanceService.getEmployeePerformance(id);
    }

    async getEmployees(filters: any, pagination: any): Promise<{ items: EmployeeDto[], total: number }> {
        // 1. Apply rules
        const validatedFilters = EmployeeBusinessRules.validateFilters(filters);

        // 2. Get data
        const employees = await this.employeeRepo.find(validatedFilters, pagination);

        // Simulated total for now since repo.find just returns the array
        const total = employees.length > 0 ? employees.length * 2 : 0;

        // 3. Apply business logic (enhance with predictions)
        const enhancedEmployees = await this.enhanceWithPredictions(employees);

        // 4. Convert to DTOs
        const items = enhancedEmployees.map(e => mapEmployeeToDto(e));

        return { items, total };
    }

    async getEmployeeById(id: string): Promise<EmployeeDto | null> {
        const employee = await this.employeeRepo.findById(id);
        if (!employee) return null;
        return mapEmployeeToDto(employee);
    }

    async createEmployee(data: any): Promise<EmployeeDto> {
        // 1. Validate
        const validation = EmployeeValidationRules.validateCreate(data);
        if (!validation.valid) {
            throw new Error(`Invalid employee data: ${validation.errors.join(', ')}`);
        }

        // 2. Enrich
        const enrichedData = EmployeeBusinessRules.enrichCreateData(data);

        // 3. Transaction: Create Employee + Insert Outbox Event
        return await db.transaction(async (tx) => {
            // Note: Bypassing repo for transactional safety as discussed
            const [employee] = await tx.insert(employees).values(enrichedData).returning();

            // Insert into Outbox
            await tx.insert(outbox).values({
                service: 'employee-service',
                eventType: 'employee.created',
                payload: employee,
                status: 'PENDING'
            });

            return mapEmployeeToDto(employee);
        });
    }

    async updateEmployee(id: string, updates: any): Promise<EmployeeDto> {
        // 1. Validate update
        EmployeeValidationRules.validateUpdate(updates);

        // 2. Check business rules
        const canUpdate = await EmployeeBusinessRules.canUpdateEmployee(id, updates);
        if (!canUpdate) {
            throw new Error('Employee cannot be updated');
        }

        // 3. Update
        const updated = await this.employeeRepo.update(id, updates);

        // 4. Update predictions
        // await this.mlService.updateEmployeePrediction(id);

        return mapEmployeeToDto(updated);
    }

    async deleteEmployee(id: string): Promise<void> {
        await this.employeeRepo.delete(id);
    }

    private async enhanceWithPredictions(employees: any[]) {
        if (!employees || employees.length === 0) return [];
        // Mock ML enhancement for now
        return employees.map(employee => ({
            ...employee
        }));
    }

    private async triggerPostCreationActions(employee: any) {
        // Mock post-creation actions
    }
}
