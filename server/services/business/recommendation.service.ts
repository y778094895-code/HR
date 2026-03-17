import { injectable, inject } from 'inversify';
import { RecommendationRepository } from '../../data/repositories/recommendation.repository';
import { IRecommendationService } from '../interfaces/i-recommendation.service';

@injectable()
export class RecommendationService implements IRecommendationService {
    constructor(
        @inject('RecommendationRepository') private recommendationRepo: RecommendationRepository
    ) { }

async getRecommendations(filters?: any): Promise<any[]> {
        if (filters?.employeeId) {
            return this.recommendationRepo.getEmployeeRecommendations(filters.employeeId);
        }
        const results = await this.recommendationRepo.findAll();
        return results;
    }

    async getRecommendationById(id: string): Promise<any> {
        const result = await this.recommendationRepo.findById(id);
        if (!result) throw new Error('Recommendation not found');
        return result;
    }

    async generateForEmployee(employeeId: string, focusArea?: string): Promise<any[]> {
        // Mock generation logic, normally this would call MLService
        const newRec = {
            employeeId,
            title: `Generated Info for ${focusArea || 'General'}`,
            recommendationType: focusArea || 'performance',
            status: 'active',
            confidence: 0.8
        };
        const created = await this.recommendationRepo.create(newRec);
        return [created];
    }

    async generateBatch(data: any): Promise<any> {
        // Mock batch generation
        return { success: true, count: 5 };
    }

    async acceptRecommendation(id: string): Promise<any> {
        return this.recommendationRepo.update(id, { status: 'accepted' });
    }

    async rejectRecommendation(id: string, reason?: string): Promise<any> {
        // Here we could store the reason in metadata or reasonCodes
        return this.recommendationRepo.update(id, { status: 'rejected' });
    }

    async applyRecommendation(id: string): Promise<any> {
        return this.recommendationRepo.update(id, { status: 'applied' });
    }
}
