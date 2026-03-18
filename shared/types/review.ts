export type CycleType = 'annual' | 'mid_year' | 'quarterly';
export type CycleStatus = 'scheduled' | 'active' | 'calibration' | 'closed';
export type ReviewerType = 'self' | 'manager' | 'peer';
export type ParticipantStatus = 'pending' | 'in_progress' | 'submitted' | 'overdue';
export type ReviewStatus = 'draft' | 'submitted' | 'calibrated' | 'locked' | 'acknowledged';

export interface TemplateSection {
  key: string;
  labelEn: string;
  labelAr: string;
  weight: number;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  ratingScale: number;
  sections: TemplateSection[];
  openTextEnabled: boolean;
  createdAt: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  type?: CycleType | null;
  startDate: string;
  endDate: string;
  status: string;
  cycleStatus: CycleStatus;
  templateId?: string | null;
  template?: ReviewTemplate | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface ReviewParticipant {
  id: string;
  cycleId: string;
  revieweeId: string;
  reviewerId: string;
  reviewerType: ReviewerType;
  status: ParticipantStatus;
  assignedAt: string;
  reviewee?: { id: string; nameEn: string; nameAr?: string };
  reviewer?: { id: string; nameEn: string; nameAr?: string };
}

export interface Review {
  id: string;
  participantId: string;
  ratings: Record<string, number>;
  comments: Record<string, string>;
  goalAttainmentPct?: number | null;
  compositeScore?: number | null;
  status: ReviewStatus;
  submittedAt?: string | null;
  lockedAt?: string | null;
  lockedBy?: string | null;
  acknowledgedAt?: string | null;
}

export interface ReviewReport {
  reviewee: { id: string; nameEn: string; nameAr?: string };
  cycle: { id: string; name: string };
  compositeScore: number;
  goalAttainmentPct: number;
  sectionScores: Array<{
    key: string;
    labelEn: string;
    labelAr: string;
    weightedScore: number;
  }>;
  peerComments: string[];
  status: ReviewStatus;
}

export interface AssignParticipantsDto {
  revieweeId: string;
  reviewers: Array<{ reviewerId: string; reviewerType: ReviewerType }>;
}

export interface SubmitReviewDto {
  ratings: Record<string, number>;
  comments?: Record<string, string>;
}
