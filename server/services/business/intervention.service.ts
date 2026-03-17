import { injectable, inject } from 'inversify';
import { IInterventionService } from '../interfaces/i-intervention.service';
import { InterventionRepository } from '../../data/repositories/intervention.repository';
import { InterventionEntity } from '../domain/intervention.entity';

@injectable()
export class InterventionService implements IInterventionService {
    constructor(
        @inject('InterventionRepository') private interventionRepo: InterventionRepository
    ) { }

    async getAll(filters: any): Promise<InterventionEntity[]> {
        const results = await this.interventionRepo.find(filters);
        return results.map((r: any) => new InterventionEntity(
            r.id,
            r.employeeId,
            r.type,
            r.status,
            r.actionPlan as any[] || []
        ));
    }

    async getById(id: string): Promise<InterventionEntity> {
        const r = await this.interventionRepo.findById(id);
        if (!r) throw new Error('Intervention not found');
        return new InterventionEntity(r.id, r.employeeId, r.type, r.status, r.actionPlan as any[] || []);
    }

    async create(data: any): Promise<InterventionEntity> {
        const r = await this.interventionRepo.create(data);
        return new InterventionEntity(r.id, r.employeeId, r.type, r.status, r.actionPlan as any[] || []);
    }

    async update(id: string, data: any): Promise<InterventionEntity> {
        const r = await this.interventionRepo.update(id, data);
        return new InterventionEntity(r.id, r.employeeId, r.type, r.status, r.actionPlan as any[] || []);
    }

    async triggerIntervention(employeeId: string, type: string): Promise<void> {
        await this.create({
            employeeId,
            type,
            status: 'pending',
            actions: [],
            title: `Intervention: ${type}`
        });
    }

    async completeIntervention(id: string, result: any): Promise<void> {
        await this.update(id, { status: 'completed', result });
    }

    async getInterventions(filters?: any): Promise<any> {
        const results = await this.interventionRepo.find(filters);
        return {
            items: results,
            total: results.length,
            page: 1,
            pageSize: 50,
            totalPages: 1
        };
    }

    async getInterventionDetail(id: string): Promise<any> {
        const r = await this.interventionRepo.findById(id);
        if (!r) throw new Error('Intervention not found');
        return r;
    }

    async createIntervention(data: any): Promise<any> {
        return this.interventionRepo.create(data);
    }

    async updateStatus(id: string, status: string): Promise<void> {
        await this.interventionRepo.update(id, { status });
    }

    async logAction(id: string, action: string, notes?: string): Promise<void> {
        const intervention = await this.getInterventionDetail(id);
        const actionPlan = intervention.actionPlan || [];
        actionPlan.push({ action, notes, date: new Date() });
        await this.interventionRepo.update(id, { actionPlan });
    }

    async getHistory(id: string): Promise<any[]> {
        // Return mock history
        return [
            { id: '1', eventType: 'created', createdAt: new Date(Date.now() - 86400000) },
            { id: '2', eventType: 'status_changed', payload: { status: 'in_progress' }, createdAt: new Date() }
        ];
    }

    async assign(id: string, ownerId: string): Promise<void> {
        await this.interventionRepo.update(id, { ownerId, status: 'in_progress' });
    }

    async close(id: string, notes?: string): Promise<void> {
        await this.interventionRepo.update(id, { status: 'closed', actualOutcome: { notes } });
    }

    async getAnalytics(): Promise<any> {
        return {
            totalActive: 15,
            successRate: 0.85,
            avgResolutionDays: 12,
            byType: [
                { type: 'Performance', count: 8 },
                { type: 'Burnout', count: 4 },
                { type: 'Flight Risk', count: 3 }
            ]
        };
    }

    async getRecommendations(): Promise<any[]> {
        return [
            { id: 'rec-1', type: 'training', title: 'Communication Skills', description: 'Recommended based on low 360 review score.' }
        ];
    }

    async handleRecommendationAction(id: string, action: 'accept' | 'reject' | 'apply'): Promise<void> {
        // Mock handler
        console.log(`Recommendation ${id} actioned: ${action}`);
    }
}
