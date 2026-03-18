export type RiskBand = 'low' | 'medium' | 'high' | 'critical';

export interface ShapFeature {
  feature: string;
  value: number;
  shap: number;
  direction: 'positive' | 'negative';
  labelEn: string;
  labelAr: string;
}

export interface RiskScore {
  id: string;
  employeeId: string;
  score: number;
  band: RiskBand;
  features: ShapFeature[];
  modelVersion: string;
  isStale: boolean;
  predictedAt: string;
  createdAt: string;
}

export interface RiskFeature {
  key: string;
  labelEn: string;
  labelAr: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface RiskPredictionRequest {
  employeeId: string;
  features: {
    tenureMonths: number;
    salaryPercentile: number;
    daysSinceLastReview: number;
    goalCompletionPct: number;
    attendanceRate: number;
    managerTenureMonths: number;
    departmentTurnoverRate12m: number;
    performanceTrend: number;
    engagementScore?: number;
    promotionMonthsOverdue?: number;
  };
}

export interface BatchRiskRequest {
  departmentId?: string;
  staleOnly?: boolean;
}

export interface BatchRiskResponse {
  batchId: string;
  employeeCount: number;
  message: string;
}
