export type GoalStatus = 'draft' | 'in_progress' | 'overdue' | 'completed' | 'archived';
export type KpiFrequency = 'daily' | 'weekly' | 'monthly';
export type ObjectiveStatus = 'active' | 'closed';

export interface Goal {
  id: string;
  employeeId: string;
  cycleId?: string | null;
  parentObjectiveId?: string | null;
  title: string;
  description?: string | null;
  category: string;
  targetValue?: number | null;
  currentValue: number;
  unit?: string | null;
  weight: number;
  dueDate?: string | null;
  status: GoalStatus;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  kpis?: KPI[];
}

export interface KPI {
  id: string;
  goalId: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit?: string | null;
  measurementFrequency: KpiFrequency;
  lastUpdatedAt?: string | null;
  createdAt: string;
}

export interface OrgObjective {
  id: string;
  title: string;
  description?: string | null;
  ownerId?: string | null;
  targetDate?: string | null;
  status: ObjectiveStatus;
  createdAt: string;
  departments?: string[];
}

export interface CreateGoalDto {
  employeeId: string;
  cycleId?: string;
  parentObjectiveId?: string;
  title: string;
  description?: string;
  category: string;
  targetValue?: number;
  unit?: string;
  weight: number;
  dueDate?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  category?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  weight?: number;
  dueDate?: string;
  status?: GoalStatus;
}

export interface UpdateKpiDto {
  currentValue: number;
}
