// ============================================================
// Profile Data Adapter — Delivery-Grade Aggregation Layer
//
// Assembles a complete employee profile bundle by fetching from
// multiple backend endpoints and normalizing transport keys.
//
// IMPORTANT: This adapter ONLY uses real backend data. localStorage is
// used ONLY for lightweight UX continuity (temporarily storing user
// actions during offline/session), never as a source of synthesized
// business intelligence (Risk/Fairness/Impact/Timeline analytics).
// ============================================================

import { apiClient } from '@/services/api/client';
import { normalizeKeys } from '@/services/api/normalizers';
import { employeeService } from './employee.service';
import { performanceService } from './performance.service';
import { turnoverService } from './turnover.service';
import { fairnessService } from './fairness.service';
import { trainingService } from './training.service';
import { interventionService } from './intervention.service';
import type { Employee } from '@/types/users';
import type { TurnoverRisk, RiskFactor } from '@/types/risk';
import type { BiasMetric } from '@/types/fairness';
import type { Intervention, Recommendation, ImpactStats } from '@/types/intervention';
import type { SkillGap, TrainingRecommendation } from './training.service';
import type { EmployeePerformanceDetail } from './performance.service';

// ---- Exported types consumed by components ----

/**
 * Risk driver with directional indicator.
 * Extends the canonical RiskFactor with a `direction` field used
 * by XAI UI components (AttritionTab, XAIDetailDrawer, etc.).
 */
export type RiskDriver = RiskFactor & {
    /** Whether this factor pushes risk UP or DOWN */
    direction?: 'UP' | 'DOWN';
};

export type EmployeeRisk = {
    riskScore: number;
    confidenceScore: number;
    mlModelVersion?: string;
    contributingFactors: RiskDriver[];
    trend: { at: string; value: number }[];
};

export type TimelineEvent = {
    id: string;
    at: string;
    type:
        | 'ALERT'
        | 'CASE_CREATED'
        | 'INTERVENTION_ASSIGNED'
        | 'STATUS_CHANGED'
        | 'THRESHOLD_UPDATED'
        | 'NOTE'
        | 'RECOMMENDATION';
    label: string;
    metadata?: Record<string, any>;
};

export type ProfilePerformance = {
    score?: number;
    rating?: string;
    trend?: { month: string; score: number }[];
    history?: { date: string; score: number }[];
    strengths?: string[];
    weaknesses?: string[];
    earlyDeclineDetected?: boolean;
    kpis?: { id: string; title: string; value: number | string; trend?: number }[];
};

export type ProfileFairness = {
    metrics?: BiasMetric[];
    salaryGap?: { value: number; status: string };
    evaluationBias?: { value: number; status: string };
    promotionEquity?: { value: number; status: string };
    overallAlert?: boolean;
};

export type ProfileTraining = {
    skillGaps?: SkillGap[];
    recommendations?: TrainingRecommendation[];
};

export type ProfileImpact = {
    analytics?: ImpactStats;
    interventions?: Intervention[];
};

/**
 * Composite profile bundle consumed by profile page tabs.
 */
export type EmployeeProfileBundle = {
    employee: Employee;
    risk?: EmployeeRisk;
    performance?: ProfilePerformance;
    fairness?: ProfileFairness;
    training?: ProfileTraining;
    impact?: ProfileImpact;
    cases: any[];
    recommendations: Recommendation[];
    alerts: any[];
    timeline: TimelineEvent[];
};

// ---- Helpers ----

const generateId = (): string => Math.random().toString(36).substring(2, 10);

// ── Defensive normalization helpers ──

/**
 * Safely normalize any response to an array.
 * Handles: undefined, null, array, object wrappers like { data: [...] }, { items: [...] }
 */
function normalizeToArray(data: unknown): any[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
        // Handle wrapper objects
        const wrapper = data as Record<string, unknown>;
        if (Array.isArray(wrapper.data)) return wrapper.data;
        if (Array.isArray(wrapper.items)) return wrapper.items;
        if (Array.isArray(wrapper.results)) return wrapper.results;
        // If it's a single object with array-like properties
        const arrayProps = ['interventions', 'cases', 'alerts', 'recommendations', 'metrics'];
        for (const prop of arrayProps) {
            if (Array.isArray(wrapper[prop])) return wrapper[prop];
        }
    }
    return [];
}

/**
 * Safely normalize any response to an object.
 */
function normalizeToObject(data: unknown): Record<string, unknown> {
    if (!data || typeof data !== 'object') return {};
    if (Array.isArray(data)) return {};
    return data as Record<string, unknown>;
}

const UNKNOWN_EMPLOYEE: Employee = {
    id: '',
    fullName: 'Unknown Employee',
    email: 'unknown@example.com',
    department: 'Unknown',
    designation: 'Unknown role',
    dateOfJoining: '2020-01-01',
    employeeCode: '',
    employmentStatus: 'active',
};

// ---- Adapter ----

class ProfileDataAdapter {
    // ── In-session timeline persistence (secondary UX continuity only) ──

    private getLocalTimeline(employeeId: string): TimelineEvent[] {
        const key = `employee_timeline_v2_${employeeId}`;
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private appendLocalTimeline(employeeId: string, event: TimelineEvent): void {
        const key = `employee_timeline_v2_${employeeId}`;
        try {
            const existing = this.getLocalTimeline(employeeId);
            existing.unshift(event);
            localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
        } catch {
            // localStorage unavailable — silent fail
        }
    }

    // ── Cases from localStorage (secondary persistence) ──

    private getLocalCases(employeeId: string): any[] {
        const key = `employee_cases_v2_${employeeId}`;
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private saveLocalCases(employeeId: string, cases: any[]): void {
        const key = `employee_cases_v2_${employeeId}`;
        try {
            localStorage.setItem(key, JSON.stringify(cases.slice(0, 50)));
        } catch {
            // silent fail
        }
    }

    // ── Main aggregation method ──

    async getEmployeeProfile(id: string): Promise<EmployeeProfileBundle> {
        // 1. Resolve the employee record
        const employee = await employeeService.getEmployeeById(id);
        if (!employee || !employee.id) {
            throw new Error(`Employee ${id} not found`);
        }

        // 2. Fetch risk data from the turnover endpoint
        let risk: EmployeeRisk | undefined;
        try {
            const raw = await apiClient.get<Record<string, unknown>>(`/turnover/risk/${id}`);
            const normalized = normalizeKeys<TurnoverRisk & { contributing_factors?: any[] }>(raw);
            if (normalized.riskScore !== undefined) {
                const drivers: RiskDriver[] = (normalized.contributingFactors ?? []).map((f) => ({
                    factor: f.factor,
                    impact: Math.abs(f.impact),
                    description: f.description,
                    direction: (f.impact >= 0 ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
                }));

                risk = {
                    riskScore: normalized.riskScore,
                    confidenceScore: normalized.confidenceScore ?? 0,
                    mlModelVersion: normalized.mlModelVersion,
                    contributingFactors: drivers,
                    trend: [],
                };
            }
        } catch {
            console.warn('[ProfileDataAdapter] Could not fetch risk profile for employee', id);
        }

        // 3. Fetch performance data
        let performance: ProfilePerformance | undefined;
        try {
            const detail = await performanceService.getEmployeePerformanceDetail(id);
            if (detail) {
                const score = detail.score ?? (detail as any).currentRating;
                const history = detail.history ?? [];
                const trend = history.map((h: any) => ({
                    month: h.date || h.month,
                    score: h.score,
                }));

                // Detect early decline: if last 3 data points show consistent drop
                let earlyDeclineDetected = false;
                if (history.length >= 3) {
                    const last3 = history.slice(-3);
                    earlyDeclineDetected = last3.every((h: any, i: number) =>
                        i === 0 || h.score < last3[i - 1].score
                    );
                }

                performance = {
                    score: typeof score === 'number' ? score : undefined,
                    rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Critical',
                    trend,
                    history,
                    strengths: detail.strengths ?? [],
                    weaknesses: detail.weaknesses ?? [],
                    earlyDeclineDetected,
                    kpis: [],
                };
            }
        } catch {
            // Fallback: try the simpler employee performance endpoint
            try {
                const raw = await apiClient.get<Record<string, unknown>>(`/employees/${id}/performance`);
                const normalized = normalizeKeys<any>(raw);
                if (normalized.currentRating !== undefined || normalized.score !== undefined) {
                    const score = normalized.score ?? normalized.currentRating;
                    performance = {
                        score: typeof score === 'number' ? score : undefined,
                        rating: normalized.rating,
                        trend: normalized.trend ?? [],
                        history: normalized.history ?? [],
                        strengths: normalized.strengths ?? [],
                        weaknesses: normalized.weaknesses ?? [],
                        earlyDeclineDetected: normalized.earlyDeclineDetected ?? false,
                        kpis: normalized.kpis ?? [],
                    };
                }
            } catch {
                console.warn('[ProfileDataAdapter] Could not fetch performance for employee', id);
            }
        }

        // 4. Fetch fairness data
        let fairness: ProfileFairness = {};
        try {
            const metrics = await fairnessService.getFairnessMetrics({ employeeId: id } as any);
            if (metrics && Array.isArray(metrics) && metrics.length > 0) {
                fairness.metrics = metrics;

                // Derive profile-level fairness signals from metrics
                const salaryMetric = metrics.find(m => m.category === 'compensation' || m.metricName?.toLowerCase().includes('salary'));
                const evalMetric = metrics.find(m => m.category === 'evaluation' || m.metricName?.toLowerCase().includes('bias'));
                const promoMetric = metrics.find(m => m.category === 'promotion' || m.metricName?.toLowerCase().includes('promotion'));

                if (salaryMetric) {
                    fairness.salaryGap = { value: salaryMetric.value, status: salaryMetric.status };
                }
                if (evalMetric) {
                    fairness.evaluationBias = { value: evalMetric.value, status: evalMetric.status };
                }
                if (promoMetric) {
                    fairness.promotionEquity = { value: promoMetric.value, status: promoMetric.status };
                }

                fairness.overallAlert = metrics.some(m =>
                    m.status === 'flagged' || m.status === 'warning' || m.status === 'critical' || m.status === 'needs_review'
                );
            }
        } catch {
            console.warn('[ProfileDataAdapter] Could not fetch fairness data for employee', id);
        }

        // 5. Fetch training data (skill gaps + recommendations)
        let training: ProfileTraining = {};
        try {
            const [skillGaps, trainingRecs] = await Promise.allSettled([
                trainingService.getSkillGaps(id),
                trainingService.getRecommendations({ employeeId: id }),
            ]);

            if (skillGaps.status === 'fulfilled' && Array.isArray(skillGaps.value)) {
                training.skillGaps = skillGaps.value;
            }
            if (trainingRecs.status === 'fulfilled' && Array.isArray(trainingRecs.value)) {
                training.recommendations = trainingRecs.value;
            }
        } catch {
            console.warn('[ProfileDataAdapter] Could not fetch training data for employee', id);
        }

        // 6. Fetch interventions and impact analytics
        let impact: ProfileImpact = {};
        let interventionsList: Intervention[] = [];
        try {
            const [interventionsResult, analyticsResult] = await Promise.allSettled([
                interventionService.getInterventions({ employeeId: id } as any),
                interventionService.getAnalytics(),
            ]);

            if (interventionsResult.status === 'fulfilled') {
                // Defensively normalize the response
                const rawData = interventionsResult.value;
                const data = normalizeToArray(rawData);
                // Filter to this employee
                interventionsList = data.filter((i: any) => i.employeeId === id);
                impact.interventions = interventionsList;
            }
            if (analyticsResult.status === 'fulfilled') {
                const normalizedAnalytics = normalizeToObject(analyticsResult.value);
                impact.analytics = {
                    totalInterventions: typeof normalizedAnalytics.totalInterventions === 'number' ? normalizedAnalytics.totalInterventions : 0,
                    completedCount: typeof normalizedAnalytics.completedCount === 'number' ? normalizedAnalytics.completedCount : 0,
                    successRate: typeof normalizedAnalytics.successRate === 'number' ? normalizedAnalytics.successRate : 0,
                    riskReduction: typeof normalizedAnalytics.riskReduction === 'number' ? normalizedAnalytics.riskReduction : undefined,
                    trends: Array.isArray(normalizedAnalytics.trends) ? normalizedAnalytics.trends : undefined,
                    outcomes: Array.isArray(normalizedAnalytics.outcomes) ? normalizedAnalytics.outcomes : undefined,
                };
            }
        } catch (err) {
            console.warn('[ProfileDataAdapter] Could not fetch intervention/impact data for employee', id, err);
        }

        // 7. Fetch recommendations
        let recommendations: Recommendation[] = [];
        try {
            const recs = await interventionService.getRecommendations();
            const normalized = normalizeToArray(recs);
            recommendations = normalized.filter((r: any) => r.employeeId === id);
        } catch (err) {
            console.warn('[ProfileDataAdapter] Could not fetch recommendations for employee', id, err);
        }

        // 8. Fetch alerts for this employee
        let alerts: any[] = [];
        try {
            const allAlerts = await apiClient.get<any>('/alerts');
            const alertsData = normalizeToArray(allAlerts);
            alerts = alertsData.filter((a: any) =>
                a.employeeId === id || a.employee_id === id
            );
        } catch (err) {
            console.warn('[ProfileDataAdapter] Could not fetch alerts for employee', id, err);
        }

        // 9. Fetch cases for this employee from API
        // NOTE: Only real backend data is used. localStorage is NOT used for business analytics.
        let cases: any[] = [];
        try {
            const casesResponse = await apiClient.get<any>('/cases', { params: { employeeId: id } });
            const casesData = normalizeToArray(casesResponse);
            cases = casesData.filter((c: any) => c.employeeId === id || c.employee_id === id);
        } catch (err) {
            // No fallback - business data comes from backend only
            console.warn('[ProfileDataAdapter] Could not fetch cases for employee', id, err);
        }

        // 10. Build unified timeline (from real backend data only) - defensive
        const timeline = this.buildUnifiedTimeline(id, alerts, cases, interventionsList, recommendations);

        return {
            employee,
            risk,
            performance,
            fairness,
            training,
            impact,
            cases,
            recommendations,
            alerts,
            timeline,
        };
    }

    // ── Build unified timeline from all data sources ──

    private buildUnifiedTimeline(
        employeeId: string,
        alerts: any[],
        cases: any[],
        interventions: Intervention[],
        recommendations: Recommendation[]
    ): TimelineEvent[] {
        const events: TimelineEvent[] = [];

        // Alerts → timeline
        for (const alert of alerts) {
            events.push({
                id: `alert-${alert.id}`,
                at: alert.triggeredAt || alert.createdAt || new Date().toISOString(),
                type: 'ALERT',
                label: alert.title || alert.description || 'Alert triggered',
                metadata: {
                    severity: alert.severity,
                    type: alert.type,
                    status: alert.status,
                },
            });
        }

        // Cases → timeline
        for (const c of cases) {
            events.push({
                id: `case-${c.id}`,
                at: c.createdAt || new Date().toISOString(),
                type: 'CASE_CREATED',
                label: c.title || `Case ${c.id} created`,
                metadata: {
                    caseId: c.id,
                    type: c.type,
                    severity: c.severity,
                    status: c.status,
                },
            });

            // Case status changes from timeline if available
            if (c.timeline && Array.isArray(c.timeline)) {
                for (const te of c.timeline) {
                    events.push({
                        id: `case-event-${te.id || generateId()}`,
                        at: te.date || te.at || new Date().toISOString(),
                        type: 'STATUS_CHANGED',
                        label: te.description || 'Case updated',
                        metadata: { caseId: c.id, user: te.user },
                    });
                }
            }
        }

        // Interventions → timeline
        for (const intv of interventions) {
            events.push({
                id: `intv-${intv.id}`,
                at: intv.createdAt || new Date().toISOString(),
                type: 'INTERVENTION_ASSIGNED',
                label: intv.description || intv.type || 'Intervention assigned',
                metadata: {
                    interventionId: intv.id,
                    type: intv.type,
                    status: intv.status,
                    priority: intv.priority,
                },
            });

            if (intv.completedAt) {
                events.push({
                    id: `intv-complete-${intv.id}`,
                    at: intv.completedAt,
                    type: 'STATUS_CHANGED',
                    label: `Intervention "${intv.type}" completed`,
                    metadata: { interventionId: intv.id, status: 'completed' },
                });
            }
        }

        // Recommendations → timeline
        for (const rec of recommendations) {
            events.push({
                id: `rec-${rec.id}`,
                at: (rec as any).createdAt || new Date().toISOString(),
                type: 'RECOMMENDATION',
                label: rec.title || 'Recommendation generated',
                metadata: {
                    recommendationType: rec.recommendationType,
                    status: rec.status,
                    confidenceScore: rec.confidenceScore,
                },
            });
        }

        // Merge in-session local timeline events
        const localEvents = this.getLocalTimeline(employeeId);
        for (const le of localEvents) {
            // Avoid duplicates by checking id prefix
            if (!events.some(e => e.id === le.id)) {
                events.push(le);
            }
        }

        // Sort newest first
        events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

        return events;
    }

    // ── Action: Record a local timeline event (in-session UX continuity) ──

    recordTimelineEvent(employeeId: string, event: Omit<TimelineEvent, 'id'>): TimelineEvent {
        const fullEvent: TimelineEvent = {
            ...event,
            id: `local-${generateId()}`,
        };
        this.appendLocalTimeline(employeeId, fullEvent);
        return fullEvent;
    }

    // ── Action: Save case locally (secondary persistence) ──

    saveCaseLocally(employeeId: string, caseData: any): void {
        const cases = this.getLocalCases(employeeId);
        cases.unshift(caseData);
        this.saveLocalCases(employeeId, cases);
    }

    // ── Action: Create case via API (primary), fallback to local ──

    async createCase(employeeId: string, caseData: { title: string; type: string; severity: string }): Promise<any> {
        try {
            // Try API first
            const response = await apiClient.post<any>('/cases', {
                employeeId,
                title: caseData.title,
                type: caseData.type,
                severity: caseData.severity,
                status: 'Open',
                createdAt: new Date().toISOString(),
            });
            return normalizeKeys(response);
        } catch (err) {
            console.warn('[ProfileDataAdapter] API create case failed, falling back to localStorage', err);
            // Fallback to localStorage
            const localCase = {
                id: `local-${generateId()}`,
                ...caseData,
                employeeId,
                status: 'Open',
                createdAt: new Date().toISOString(),
            };
            this.saveCaseLocally(employeeId, localCase);
            return localCase;
        }
    }

    // ── Action: Assign training via API (primary), fallback to local ──

    async assignTraining(employeeId: string, trainingData: { skill: string; type: string }): Promise<any> {
        try {
            // Try API first - create an intervention
            const response = await apiClient.post<any>('/interventions', {
                employeeId,
                type: trainingData.type || 'Training',
                description: trainingData.skill,
                status: 'planned',
                priority: 'medium',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                createdAt: new Date().toISOString(),
            });
            return normalizeKeys(response);
        } catch (err) {
            console.warn('[ProfileDataAdapter] API assign training failed, falling back to localStorage', err);
            // Fallback to localStorage - record as timeline event
            const localIntervention = {
                id: `local-${generateId()}`,
                employeeId,
                type: trainingData.type || 'Training',
                description: trainingData.skill,
                status: 'planned',
                priority: 'medium',
                createdAt: new Date().toISOString(),
            };
            // Save as local case for tracking
            this.saveCaseLocally(employeeId, localIntervention);
            // Also log as timeline event
            this.recordTimelineEvent(employeeId, {
                at: new Date().toISOString(),
                type: 'INTERVENTION_ASSIGNED',
                label: `Training assigned: ${trainingData.skill}`,
            });
            return localIntervention;
        }
    }
}

export const profileDataAdapter = new ProfileDataAdapter();
export default profileDataAdapter;
