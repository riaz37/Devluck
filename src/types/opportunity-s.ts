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
  applicantId: number;

  contractTitle: string;
  company: string;
  salary: string;
  jobType: "Full-time" | "Part-time" | "Contract";
  location: string;

  jobDescription: string;
  workProgress: number;

  deadline: string;
  startDate: string;
  endDate: string;

  status: "Running";
  applicantIds: string[];

  companyId: string;

  opportunityStatus: OpportunityStatus;
  opportunityFrom: "Company" | "Investor";

  skills: string[];
  benefits: string[];
  keyResponsibilities: string[];
  whyYoullLoveWorkingHere: string[];

  originalStatus: BackendApplicationStatus;
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