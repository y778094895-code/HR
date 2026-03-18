import type { RiskBand } from './risk';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';
export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';

export interface Employee {
  id: string;
  userId?: string | null;
  nameEn: string;
  nameAr?: string | null;
  email: string;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  jobTitleId?: string | null;
  jobTitle?: { id: string; name: string } | null;
  managerId?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  salaryCurrency?: string | null;
  erpNextId?: string | null;
  status: EmployeeStatus;
  showRiskToEmployee?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  latestRiskBand?: RiskBand | null;
}

export interface TimelineEvent {
  type: 'review_submitted' | 'risk_band_change' | 'goal_completed' | 'recommendation_actioned' | 'training_completed';
  occurredAt: string;
  summary: string;
}

export interface CreateEmployeeDto {
  nameEn: string;
  nameAr?: string;
  email: string;
  departmentId?: string;
  jobTitleId?: string;
  managerId?: string;
  hireDate?: string;
  salary?: number;
  salaryCurrency?: string;
  erpNextId?: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  showRiskToEmployee?: boolean;
}
