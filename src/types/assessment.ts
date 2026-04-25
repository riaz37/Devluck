// ===============================================
// types/assessment.ts
// ===============================================

export type AssessmentSource = "public" | "private";

export type AssessmentStatus =
  | "not_started"
  | "in_progress"
  | "evaluating"
  | "completed";

export interface AssessmentOpportunity {
  id: string;
  title: string;
  visibility: string;
  hasAssessment: boolean;
  companyStyle?: string;
  assessmentDeadlineHours?: number | null;
}

export interface AssessmentItem {
  source: AssessmentSource;

  applicationId: string | null;
  inviteToken: string | null;

  opportunity: AssessmentOpportunity | null;

  appliedAt: string;

  assessmentStatus: AssessmentStatus | string;
  sessionStatus: AssessmentStatus | string | null;

  sessionId: string | null;

  hasReport: boolean;
  canStart: boolean;
}