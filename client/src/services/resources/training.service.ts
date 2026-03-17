// ============================================================
// Training Service (PR-02)
//
// All local interfaces now use camelCase, aligned to PR-01 naming.
// Transport normalization via normalizeKeys at every response.
//
// Transport assumption: backend endpoints return snake_case keys
// (e.g. skill_name, required_level, match_score, program_id).
// Query params sent to backend remain snake_case where needed.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import type { ApiParams } from '../api/types';
import type { TrainingModule } from './types';

// ---- Frontend-safe interfaces (camelCase, PR-01 aligned) ----

export interface SkillGap {
    skillName: string;
    requiredLevel: number;
    currentLevel: number;
    gapScore: number;
    priority: 'high' | 'medium' | 'low';
}

export interface TrainingRecommendation {
    id: string;
    employeeId: string;
    module: TrainingModule;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    matchScore: number;
}

export interface TrainingEffectiveness {
    programId: string;
    programTitle: string;
    completionRate: number;
    avgScoreImprovement: number;
    roiScore: number;
    feedbackRating: number;
}

// ---- Service ----

class TrainingService {
    /**
     * Analyze skill gaps for an employee.
     */
    async getSkillGaps(employeeId: string): Promise<SkillGap[]> {
        const raw = await apiClient.get<unknown[]>(
            `/training/skills/${employeeId}/gaps`
        );
        return normalizeKeys<SkillGap[]>(raw);
    }

    /**
     * Get AI-driven training recommendations.
     */
    async getRecommendations(
        params?: ApiParams & { employeeId?: string }
    ): Promise<TrainingRecommendation[]> {
        const raw = await apiClient.get<unknown[]>('/training/recommendations', {
            params,
        });
        return normalizeKeys<TrainingRecommendation[]>(raw);
    }

    /**
     * Approve a training recommendation (Manager/HR action).
     */
    async approveRecommendation(id: string): Promise<void> {
        await apiClient.post(`/training/recommendations/${id}/approve`);
    }

    /**
     * Reject a training recommendation.
     */
    async rejectRecommendation(id: string, reason?: string): Promise<void> {
        await apiClient.post(`/training/recommendations/${id}/reject`, { reason });
    }

    /**
     * Get effectiveness metrics for training programs.
     *
     * NOTE: Query param is sent as `program_id` (snake_case) because the
     * backend expects this key. Response is normalized to camelCase.
     */
    async getTrainingEffectiveness(
        programId?: string
    ): Promise<TrainingEffectiveness[]> {
        // Transport boundary: backend expects snake_case query param
        const params = programId ? { program_id: programId } : {};
        const raw = await apiClient.get<unknown[]>('/training/effectiveness', {
            params,
        });
        return normalizeKeys<TrainingEffectiveness[]>(raw);
    }
}

export const trainingService = new TrainingService();
