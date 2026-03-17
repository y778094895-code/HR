import { injectable, inject } from 'inversify';
import { IEmployeeService } from '../../services/interfaces/i-employee.service';
import { EmployeeService } from '../../services/business/employee.service';
import { EmployeeRepository } from '../../data/repositories/employee.repository';
import { MLServiceClient } from '../../data/external/ml.service.client';
import { DatabaseConnection } from '../../data/database/connection';
import { PerformanceRepository } from '../../data/repositories/performance.repository';
import { PerformanceService } from '../../services/business/performance.service';
// import { ConfigService } from '../config/config.service'; // Mock

export class ServiceFactory {
    // Simple static factory for now as per prompt
    static createEmployeeService(dbConnection: DatabaseConnection, mlClient: MLServiceClient): IEmployeeService {
        const repo = new EmployeeRepository(dbConnection);
        const performanceRepo = new PerformanceRepository(dbConnection);
        const performanceService = new PerformanceService(performanceRepo);
        return new EmployeeService(repo, mlClient, performanceService);
    }

    // More complex factory logic can be added here
}
