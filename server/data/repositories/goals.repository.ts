import { injectable, inject } from 'inversify';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { DatabaseConnection } from '../database/connection';
import { goals, kpis, orgObjectives } from '../models/goals.schema';
import type { Goal, NewGoal, Kpi, NewKpi, OrgObjective, NewOrgObjective } from '../models/goals.schema';

@injectable()
export class GoalsRepository {
  constructor(@inject('DatabaseConnection') private readonly db: DatabaseConnection) {}

  // ── Goals ─────────────────────────────────────────────────────────────────

  async findByEmployee(employeeId: string): Promise<Goal[]> {
    return this.db.db.select().from(goals)
      .where(and(eq(goals.employeeId, employeeId)));
  }

  async findByCycle(cycleId: string): Promise<Goal[]> {
    return this.db.db.select().from(goals).where(eq(goals.cycleId, cycleId));
  }

  async findById(id: string): Promise<Goal | undefined> {
    const [row] = await this.db.db.select().from(goals).where(eq(goals.id, id));
    return row;
  }

  async create(data: NewGoal): Promise<Goal> {
    const [row] = await this.db.db.insert(goals).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<NewGoal>): Promise<Goal | undefined> {
    const [row] = await this.db.db.update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return row;
  }

  async sumWeightForEmployee(employeeId: string, cycleId?: string, excludeId?: string): Promise<number> {
    const conditions = [eq(goals.employeeId, employeeId)];
    if (cycleId) conditions.push(eq(goals.cycleId, cycleId));
    if (excludeId) conditions.push(sql`${goals.id} != ${excludeId}`);
    const [result] = await this.db.db
      .select({ total: sql<number>`coalesce(sum(${goals.weight}), 0)` })
      .from(goals)
      .where(and(...conditions));
    return Number(result?.total ?? 0);
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────

  async findKpisByGoal(goalId: string): Promise<Kpi[]> {
    return this.db.db.select().from(kpis).where(eq(kpis.goalId, goalId));
  }

  async createKpi(data: NewKpi): Promise<Kpi> {
    const [row] = await this.db.db.insert(kpis).values(data).returning();
    return row;
  }

  async updateKpi(id: string, data: Partial<NewKpi>): Promise<Kpi | undefined> {
    const [row] = await this.db.db.update(kpis)
      .set({ ...data, lastUpdatedAt: new Date() })
      .where(eq(kpis.id, id))
      .returning();
    return row;
  }

  async deleteKpi(id: string): Promise<void> {
    await this.db.db.delete(kpis).where(eq(kpis.id, id));
  }

  // ── Org Objectives ────────────────────────────────────────────────────────

  async findObjectives(): Promise<OrgObjective[]> {
    return this.db.db.select().from(orgObjectives);
  }

  async findObjectiveById(id: string): Promise<OrgObjective | undefined> {
    const [row] = await this.db.db.select().from(orgObjectives).where(eq(orgObjectives.id, id));
    return row;
  }

  async createObjective(data: NewOrgObjective): Promise<OrgObjective> {
    const [row] = await this.db.db.insert(orgObjectives).values(data).returning();
    return row;
  }
}
