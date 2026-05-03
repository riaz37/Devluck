export type ContractStatus = "All" | "Running" | "Completed" | "Disputed";

export interface MappedContract {
  applicantId: string;
  name: string;
  contractTitle: string;
  startDate: string;
  endDate: string;
  contractStatus: ContractStatus | string;
  id: string;
  image?: string;
  salaryPaid?: string;
  workProgress?: number;
  currency: string;
}