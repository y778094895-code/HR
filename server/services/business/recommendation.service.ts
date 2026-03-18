import { injectable, inject } from 'inversify';
import { RecommendationRepository } from '../../data/repositories/recommendation.repository';
import { MLServiceClient } from '../../data/external/ml.service.client';
import { IRecommendationService } from '../interfaces/i-recommendation.service';

// ── Rule-based fallback definitions ─────────────────────────────────────────
// Applied when the ML service is unavailable (T093).
interface RuleRec {
    title: string;
    titleAr: string;
    recommendationType: string;
    rationale: string;
    rationaleAr: string;
    confidence: number;
}

function buildRuleBasedRecommendations(employeeId: string): RuleRec[] {
    return [
        {
            title: 'Conduct Stay Interview',
            titleAr: 'إجراء مقابلة الاحتفاظ',
            recommendationType: 'retention',
            rationale: 'High risk score detected. A stay interview can surface underlying concerns before the employee decides to leave.',
            rationaleAr: 'تم رصد درجة خطر مرتفعة. تساعد مقابلة الاحتفاظ على الكشف عن المخاوف الكامنة.',
            confidence: 0.80,
        },
        {
            title: 'Review Compensation Positioning',
            titleAr: 'مراجعة مستوى التعويض',
            recommendationType: 'compensation',
            rationale: 'Salary below market median is a leading predictor of attrition. Review pay band positioning.',
            rationaleAr: 'الراتب أقل من متوسط السوق هو مؤشر رئيسي على الانسحاب. راجع نطاق الراتب.',
            confidence: 0.75,
        },
        {
            title: 'Assign Development Opportunity',
            titleAr: 'تخصيص فرصة تطوير',
            recommendationType: 'development',
            rationale: 'Employees without a recent development opportunity show higher attrition likelihood.',
            rationaleAr: 'الموظفون الذين لم تُتح لهم فرصة تطوير مؤخراً يُظهرون احتمالاً أعلى للانسحاب.',
            confidence: 0.70,
        },
    ];
}

// ────────────────────────────────────────────────────────────────────────────

@injectable()
export class RecommendationService implements IRecommendationService {
    constructor(
        @inject('RecommendationRepository') private recommendationRepo: RecommendationRepository,
        @inject('MLServiceClient') private mlService: MLServiceClient,
    ) { }

    async getRecommendations(filters?: any): Promise<any[]> {
        if (filters?.employeeId) {
            return this.recommendationRepo.getEmployeeRecommendations(filters.employeeId);
        }
        return this.recommendationRepo.findAll();
    }

    async getRecommendationById(id: string): Promise<any> {
        const result = await this.recommendationRepo.findById(id);
        if (!result) throw new Error('Recommendation not found');
        return result;
    }

    /**
     * Generate recommendations for an employee (T093).
     * Calls ML service first; falls back to rule-based engine on 5xx / timeout.
     */
    async generateForEmployee(employeeId: string, focusArea?: string): Promise<any[]> {
        let mlRecs: any[] = [];
        let usedFallback = false;

        try {
            mlRecs = await this.mlService.getRecommendations(employeeId, focusArea);
        } catch (e: any) {
            console.warn(`[RecommendationService] ML service unavailable for ${employeeId}: ${e.message}. Applying rule-based fallback.`);
            usedFallback = true;
        }

        const recsToSave: any[] = usedFallback || !mlRecs?.length
            ? buildRuleBasedRecommendations(employeeId).map((r) => ({
                employeeId,
                title: r.title,
                titleAr: r.titleAr,
                recommendationType: r.recommendationType,
                rationale: r.rationale,
                rationaleAr: r.rationaleAr,
                status: 'active',
                confidence: r.confidence,
                source: 'rule_based',
              }))
            : mlRecs.map((r: any) => ({
                employeeId,
                title: r.title ?? r.recommendation ?? 'ML Recommendation',
                titleAr: r.title_ar ?? r.title ?? '',
                recommendationType: r.type ?? focusArea ?? 'performance',
                rationale: r.rationale ?? '',
                rationaleAr: r.rationale_ar ?? '',
                status: 'active',
                confidence: r.confidence ?? r.score ?? 0.8,
                source: 'ml',
              }));

        const created = await Promise.all(recsToSave.map((rec) => this.recommendationRepo.create(rec)));
        return created;
    }

    async generateBatch(data: any): Promise<any> {
        return { success: true, count: 0, message: 'Batch generation delegated to async worker' };
    }

    /** Mark recommendation as actioned (T094). */
    async action(id: string, actionedBy: string, note?: string): Promise<any> {
        return this.recommendationRepo.update(id, { status: 'actioned', actionedBy, actionNote: note });
    }

    /** Dismiss a recommendation with optional reason (T094). */
    async dismiss(id: string, reason?: string): Promise<any> {
        return this.recommendationRepo.update(id, { status: 'dismissed', dismissReason: reason });
    }

    // Legacy aliases kept for backwards compatibility
    async acceptRecommendation(id: string): Promise<any> { return this.action(id, 'system'); }
    async rejectRecommendation(id: string, reason?: string): Promise<any> { return this.dismiss(id, reason); }
    async applyRecommendation(id: string): Promise<any> { return this.recommendationRepo.update(id, { status: 'applied' }); }
}
