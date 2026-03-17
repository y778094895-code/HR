import { injectable, inject } from 'inversify';
import { IRiskCaseService } from '../interfaces/i-risk-case.service';
import { RiskCaseRepository } from '../../data/repositories/riskCase.repository';
import { OutboxService } from '../../shared/infrastructure/outbox.service';

@injectable()
export class RiskCaseService implements IRiskCaseService {
    constructor(
        @inject('RiskCaseRepository') private riskCaseRepo: RiskCaseRepository,
        @inject('OutboxService') private outboxService: OutboxService
    ) {}

    async getCasesByEmployee(employeeId: string): Promise<any[]> {
        return this.riskCaseRepo.findByEmployee(employeeId);
    }

    async createCase(employeeId: string, data: any): Promise<any> {
        const caseData = {
            employeeId,
            ...data,
            openedAt: new Date()
        };
        const created = await this.riskCaseRepo.createCase(caseData);

        // Audit outbox
        await this.outboxService.storeEvent('risk-case', 'risk_case.created', {
            caseId: created.id,
            employeeId,
            ...data
        });

        return created;
    }

    async updateCase(id: string, updates: any): Promise<any> {
        const result = await this.riskCaseRepo.update(id, updates);
        return result;
    }
}
