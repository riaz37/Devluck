// types/contract-s.ts

export type ContractStatus = "Running" | "Completed" | "Disputed";

export interface MappedContract {
  id: string;
  applicantId: number;
  contractTitle: string;
  company: string;
  jobType: string;
  location: string;
  workProgress: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  salary: string;
  startedAt: string;
  note: string;
  opportunity?: {
    id: string;
    title: string;
    details: string;
    skills: string[];
    benefits: string[];
    keyResponsibilities: string[];
    whyYouWillLoveWorkingHere: string[];
    location?: string;
    type?: string;
    timeLength?: string;
    currency?: string;
    allowance?: string;
  };
}