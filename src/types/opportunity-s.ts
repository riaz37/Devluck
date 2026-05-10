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
  opportunityId: string;  
  applicantId: number;

  // CORE
  opportunityTitle: string;
  company: string;
  companyId: string;

  // COMPANY ENRICHMENT
  companyLogo?: string;
  companyIndustry?: string;
  companyLocation?: string;
  companyWebsite?: string;

  // JOB DETAILS
  salary: string;
  currency: string;
  allowance?: string | number;

  jobType: "Full-time" | "Part-time"| "Internship";

  location: "Onsite" | "Remote" | "Hybrid";
  jobDescription: string;

  // TIME INFO
  timeLength?: string;
  startDate: string;
  endDate: string;
  deadline: string;

  // STATUS
  status: string; // keep flexible because you use "Running"
  opportunityStatus: string; // derived from backend
  opportunityFrom: "Company" | "Investor";

  // PROGRESS
  workProgress: number;

  // APPLICATION
  applicationId?: string;
  appliedAt?: string;

  applicantIds: string[];

  // ASSESSMENT SYSTEM
  hasAssessment?: boolean;
  assessmentDeadlineHours?: number;
  questionMode?: string;
  fitProfile?: string | null;

  assessmentSource?: "public" | "private";
  assessmentStatus?: string;
  sessionStatus?: string | null;
  sessionId?: string | null;
  inviteToken?: string | null;

  canStartAssessment?: boolean;
  assessmentBlockedReason?: string | null;

  // CONTENT
  skills: string[];
  benefits: string[];
  keyResponsibilities: string[];
  whyYoullLoveWorkingHere: string[];
}