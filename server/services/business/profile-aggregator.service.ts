import { injectable, inject } from 'inversify';
import { sql } from 'drizzle-orm';
import { IEmployeeService } from '../interfaces/i-employee.service';
import { IFairnessService } from '../interfaces/i-fairness.service';
import { ITrainingService } from '../interfaces/i-training.service';
import { TurnoverService } from './turnover.service';
import { IRiskCaseService } from '../interfaces/i-risk-case.service';
import { PerformanceRepository } from '../../data/repositories/performance.repository';
import { InterventionRepository } from '../../data/repositories/intervention.repository';
import { RecommendationRepository } from '../../data/repositories/recommendation.repository';
import { AlertsRepository } from '../../data/repositories/alerts.repository';
import { OutboxService } from '../../shared/infrastructure/outbox.service';
import { db } from '../../data/database/connection';
import { interventionEvents } from '../../data/models/interventions.schema';


// Basic in-memory cache to replace Redis for simplicity
class MemoryCache {
    private cache: Map<string, { value: any; expiry: number }> = new Map();

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    set(key: string, value: any, ttlSeconds: number): void {
        const expiry = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { value, expiry });
    }

    delete(key: string): void {
        this.cache.delete(key);
    }
}

const memoryCache = new MemoryCache();

export interface ProfileTabsQuery {
    tabs?: string; // comma-separated list like "overview,performance,risk"
}

@injectable()
export class ProfileAggregatorService {
    constructor(
        @inject('IEmployeeService') private employeeService: IEmployeeService,
        @inject('IFairnessService') private fairnessService: IFairnessService,
        @inject('ITrainingService') private trainingService: ITrainingService,
        @inject('TurnoverService') private turnoverService: TurnoverService,
        @inject('IRiskCaseService') private riskCaseService: IRiskCaseService,
        @inject('PerformanceRepository') private performanceRepo: PerformanceRepository,
        @inject('InterventionRepository') private interventionRepo: InterventionRepository,
        @inject('RecommendationRepository') private recommendationRepo: RecommendationRepository,
        @inject('AlertsRepository') private alertsRepo: AlertsRepository,
        @inject('OutboxService') private outboxService: OutboxService
    ) { }

    private generateCacheKey(employeeId: string, role: string, tab: string): string {
        return `cmp:v1:emp:${employeeId}:role:${role}:${tab}`;
    }

    async getProfileAggregate(employeeId: string, query: ProfileTabsQuery, userRole: string): Promise<any> {
        // 1. Fetch Identity (Always returned)
        const employee = await this.employeeService.getEmployeeById(employeeId);
        if (!employee) throw new Error('Employee not found');

        const response: any = {
            meta: {
                version: "1.0",
                updated_at: new Date().toISOString()
            },
            identity: {
                employee_id: employee.id,
                fullName: employee.fullName,
                department: employee.department,
                role: employee.designation,
                email: employee.email,
                employeeCode: employee.employeeCode,
                status: employee.employmentStatus || 'active'
            }
        };

        const tabs = query.tabs ? query.tabs.split(',') : [];

        // 2. Fetch specific tabs if requested
        if (tabs.includes('overview') || tabs.length === 0) {
            response.overview = {
                tenure_years: this.calculateTenure(employee.dateOfJoining)
            };
        }

        if (tabs.includes('performance') || tabs.length === 0) {
            response.performance = await this.performanceRepo.getEmployeePerformanceData(employeeId);
        }

        if (tabs.includes('risk') || tabs.length === 0) {
            response.risk = await this.turnoverService.getRiskDetail(employeeId);
        }

        if (tabs.includes('fairness') || tabs.length === 0) {
            const fairnessData = await this.fairnessService.analyzeDepartment(employee.department || '');
            response.fairness = fairnessData || [];
        }

        if (tabs.includes('training') || tabs.length === 0) {
            response.training = {
                skill_gaps: await this.trainingService.getSkillGaps(employeeId),
                recommendations: await this.trainingService.getRecommendations({ employee_id: employeeId })
            };
        }

        if (tabs.includes('cases') || tabs.length === 0) {
            response.cases = await this.riskCaseService.getCasesByEmployee(employeeId);
        }

        if (tabs.includes('interventions') || tabs.length === 0) {
            response.interventions = await this.interventionRepo.find({ employeeId: employeeId });
        }

        if (tabs.includes('recommendations') || tabs.length === 0) {
            response.recommendations = await this.recommendationRepo.getEmployeeRecommendations(employeeId);
        }

        if (tabs.includes('timeline') || tabs.length === 0) {
response.timeline = await this.getTimeline(employeeId, userRole);
        }

        if (tabs.includes('alerts') || tabs.length === 0) {
            response.alerts = await this.alertsRepo.findEmployeeAlerts(employeeId, 10);
        }

        return response;
    }


    async getRisk(employeeId: string, userRole: string): Promise<any> {
        return this.turnoverService.getRiskDetail(employeeId);
    }

async getTimeline(employeeId: string, userRole: string): Promise<any> {
        const recentAlerts = await this.alertsRepo.findEmployeeAlerts(employeeId, 10);
        const recentCases = await this.riskCaseService.getCasesByEmployee(employeeId);
        const recentRecs = await this.recommendationRepo.getEmployeeRecommendations(employeeId);
        const recentInterventions = await this.interventionRepo.find({ employeeId: employeeId });
        const outboxEvents = await this.outboxService.getEmployeeEvents(employeeId, 10);

        const events = [];

        // Outbox events
        for (const evt of outboxEvents) {
            events.push({
                type: 'outbox_event',
                title: evt.eventType,
                date: evt.createdAt,
                status: evt.status,
                source: 'outbox',
                id: evt.id
            });
        }

        // Alerts
            for (const a of recentAlerts) {
                events.push({
                    type: 'alert',
                    title: a.type,
                    date: a.sentAt || a.createdAt,
                    status: a.status,
                    source: 'alert',
                    id: a.id
                });
            }


        // Cases
        for (const c of recentCases.slice(0, 5)) {
            events.push({
                type: 'risk_case',
                title: `Risk Case: ${c.case_id || c.id}`,
                date: c.createdAt || c.opened_at,
                status: c.status,
                source: 'risk_case',
                id: c.case_id || c.id
            });
        }


        // Recs
            for (const r of recentRecs.slice(0, 5)) {
                events.push({
                    type: 'recommendation',
                    title: r.title,
                    date: r.createdAt,
                    status: r.status,
                    source: 'recommendation',
                    id: r.id
                });
            }


        // Interventions
        for (const i of recentInterventions.slice(0, 5)) {
            events.push({
                type: 'intervention',
                title: i.title,
                date: i.createdAt,
                status: i.status,
                source: 'intervention',
                id: i.id
            });
        }


        const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

        return {
            events: sortedEvents,
            meta: {
                note: "Phase B limited aggregation from outbox, alerts, cases, recs, interventions. Full timeline model Phase C.",
                sourceCount: events.length,
                truncated: events.length > 20
            }
        };
    }


    async createCase(employeeId: string, caseData: any, userRole: string, actorId: string): Promise<any> {
        // Ensure user has permission to create case
        if (['Executive', 'Data Analyst'].includes(userRole)) {
            throw new Error(`Role '${userRole}' is not authorized to create cases.`);
        }

        const newCase = {
            case_id: "CASE-" + Math.floor(Math.random() * 10000),
            status: "open",
            created_at: new Date().toISOString()
        };

        // Outbox pattern for Timeline Event
        await this.outboxService.storeEvent('timeline', 'CASE_CREATED', {
            subject_employee_id: employeeId,
            actor_id: actorId,
            timestamp: newCase.created_at,
            payload: {
                case_id: newCase.case_id,
                title: caseData.title,
                category: caseData.category
            }
        });

        // Invalidate cases cache
        memoryCache.delete(`cmp:v1:emp:${employeeId}:role:${userRole}:cases`);

        return {
            data: newCase,
            meta: {
                audit_ref_id: "evt-log-case-creation"
            }
        };
    }

    private maskRiskData(riskData: any, role: string): any {
        const masked = { ...riskData };
        if (role === 'Executive') {
            masked.drivers = undefined; // Executive does not see detailed drivers
        }
        if (role === 'Team Supervisor') {
            masked.drivers = undefined;
            masked.meta = undefined;
            masked.risk_score_exact = undefined;

            // Map score to band
            const score = masked.risk_score;
            if (score > 0.7) masked.risk_band = "High";
            else if (score > 0.4) masked.risk_band = "Medium";
            else masked.risk_band = "Low";

            masked.risk_score = undefined;
        }
        return masked;
    }

    private maskFairnessData(fairnessData: any, role: string): any {
        const masked = { ...fairnessData };
        if (role === 'Team Supervisor' || role === 'Dept Manager') {
            // Remove exact salary figures, keep only percentages
            masked.peer_comparisons = undefined;
        }
        return masked;
    }

    private calculateTenure(dateOfJoining?: string): number {
        if (!dateOfJoining) return 0;
        const start = new Date(dateOfJoining);
        const diff = Date.now() - start.getTime();
        return Math.round((diff / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
    }
}
