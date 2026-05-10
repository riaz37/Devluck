// src/types/opportunity.ts
export type OpportunityType =
  | "Full-time"
  | "Part-time"
  | "Internship";

export type OpportunityLocation =
  | "Remote"
  | "Hybrid"
  | "Onsite";

export type Currency =
  | "USD"
  | "EUR"
  | "SAR";

export interface OpportunityData {
  id?: string;
  title: string;
  type: OpportunityType;
  timeLength: string;
  currency: Currency;
  allowance?: string;
  location?: OpportunityLocation;
  description: string;
  details?: string;
  skills?: string[];
  whyYouWillLoveWorkingHere?: string[];
  benefits?: string[];
  keyResponsibilities?: string[];
  startDate?: string;
}

export interface OpportunityUI extends OpportunityData {
  id: string;
  jobNumber: string;
  jobName: string;
  country: string;
  jobtype: OpportunityType;
  numberOfApplicants: string;
  salaryDisplay: string;
}