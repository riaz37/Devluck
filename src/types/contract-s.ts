// types/contract-s.ts

export type ContractStatus = "Running" | "Completed" | "Disputed";

export interface MappedContract {
  id: string;
  applicantId: number;
  contractTitle: string;
  location: string;
  workProgress: number;
  status: ContractStatus;
  durationMonths: number;
  salary: string;
  startDate: string;
  note?: string;
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
    company?: {
    id: string
    name: string
    logo?: string
    logoUrl?: string
    industry?: string
    location?: string
    address?: string
    website?: string
    description?: string
    phone?: string
    phoneNumber?: string
  };
}

export interface ContractDescription {
  id: string;
  contractTitle: string;
  name: string;
  createdDate: string;
  inContractNumber: string;
  inContractList: string[];
  currency: string;
  duration: number;
  monthlyAllowance: number;
  salary?: number;
  workLocation: string;
  note?: string;
  status: string;
  companyId: string;
  opportunityId?: string;
  workProgress?: number;

  company?: {
    id: string
    name: string
    logo?: string
    logoUrl?: string
    industry?: string
    location?: string
    address?: string
    website?: string
    description?: string
    phone?: string
    phoneNumber?: string
  };
}