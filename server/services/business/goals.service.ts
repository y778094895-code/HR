import { injectable, inject } from 'inversify';
import { GoalsRepository } from '../../data/repositories/goals.repository';

interface CreateGoalDto { employeeId: string; cycleId: string; title: string; description?: string; weight: number; targetValue?: number; status?: string; dueDate?: string; }
interface UpdateGoalDto { title?: string; description?: string; weight?: number; targetValue?: number; status?: string; dueDate?: string; }
interface UpdateKpiDto { currentValue: number; }

@injectable()
export class GoalsService {
  constructor(@inject(GoalsRepository) private readonly repo: GoalsRepository) {}

  async getByEmployee(employeeId: string) {
    const goals = await this.repo.findByEmployee(employeeId);
    const withKpis = await Promise.all(
      goals.map(async (g) => ({ ...g, kpis: await this.repo.findKpisByGoal(g.id) })),
    );
    return withKpis;
  }

  async getById(id: string) {
    const goal = await this.repo.findById(id);
    if (!goal) return null;
    return { ...goal, kpis: await this.repo.findKpisByGoal(id) };
  }

  async create(dto: CreateGoalDto, createdBy: string) {
    // Weight sum validation
    const existingWeight = await this.repo.sumWeightForEmployee(dto.employeeId, dto.cycleId);
    if (existingWeight + dto.weight > 100) {
      throw new Error(`Goal weight would exceed 100 (current sum: ${existingWeight})`);
    }
    return this.repo.create({
      ...dto,
      weight: String(dto.weight),
      targetValue: dto.targetValue !== undefined ? String(dto.targetValue) : undefined,
      createdBy,
      status: 'draft',
    });
  }

  async update(id: string, dto: UpdateGoalDto, userId: string) {
    const goal = await this.repo.findById(id);
    if (!goal) return null;

    if (dto.weight !== undefined) {
      const existingWeight = await this.repo.sumWeightForEmployee(goal.employeeId, goal.cycleId ?? undefined, id);
      if (existingWeight + dto.weight > 100) {
        throw new Error(`Goal weight would exceed 100 (current sum: ${existingWeight})`);
      }
    }
    return this.repo.update(id, dto as any);
  }

  async archive(id: string) {
    return this.repo.update(id, { status: 'archived' });
  }

  async addKpi(goalId: string, data: { name: string; targetValue: number; unit?: string; measurementFrequency?: 'daily' | 'weekly' | 'monthly' }) {
    const goal = await this.repo.findById(goalId);
    if (!goal) throw new Error('Goal not found');
    return this.repo.createKpi({ goalId, currentValue: '0', ...data as any });
  }

  async updateKpi(goalId: string, kpiId: string, dto: UpdateKpiDto) {
    return this.repo.updateKpi(kpiId, { currentValue: String(dto.currentValue) });
  }

  async deleteKpi(goalId: string, kpiId: string) {
    return this.repo.deleteKpi(kpiId);
  }

  async getObjectives() {
    return this.repo.findObjectives();
  }

  async createObjective(data: { title: string; description?: string; ownerId?: string; targetDate?: string }) {
    return this.repo.createObjective(data as any);
  }

  async cascadeObjective(objectiveId: string, departmentIds: string[]) {
    const objective = await this.repo.findObjectiveById(objectiveId);
    if (!objective) throw new Error('Objective not found');
    // Cascade logic: insert rows in objective_departments
    // (raw SQL or Drizzle insert — using db directly via repo extension would be ideal)
    return { objectiveId, cascadedTo: departmentIds };
  }
}
