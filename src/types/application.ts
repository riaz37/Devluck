export type BackendApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type OpportunityStatus =
  | "Applied"
  | "Upcoming Interview"
  | "Rejected"
  | "Withdrawn";

export type StatusFilter = OpportunityStatus | "All";

export interface MappedOpportunity {
  id: number;
  originalId: string;
  companyLogo?: string;
  opportunityTitle: string;
  company: string;
  salary: string;
  jobType: "Full-time" | "Part-time" | "Internship";
  location: string;
  jobDescription: string;
  startDate: string;
  opportunityStatus: OpportunityStatus;
  originalStatus: string;
  appliedAt: string;
  opportunityId: string;
  hasAssessment?: boolean;
  assessmentSource?: "public" | "private";
  assessmentStatus?: string;
  sessionStatus?: string | null;
  sessionId?: string | null;
  inviteToken?: string | null;
  canStartAssessment?: boolean;
  assessmentBlockedReason?: string | null;
}