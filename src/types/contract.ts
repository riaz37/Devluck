/* =========================================================
 * CONTRACT STATUS
 * ======================================================= */

export type ContractStatus =
  | "All"
  | "Running"
  | "Completed"
  | "Disputed";

/* =========================================================
 * RAW API CONTRACT
 * ======================================================= */

export interface ContractData {
  contractTitle: string;

  /* student */
  name: string;

  /* identifiers */
  inContractNumber: string;
  inContractList?: string[];

  /* finance */
  currency: string;
  monthlyAllowance: number;
  salary?: number | null;

  /* contract info */
  duration: string;
  workLocation?: string;
  note?: string;

  /* status */
  status: string;
  workProgress?: number;
  hasReport?: boolean;
}

export interface Contract extends ContractData {
  id: string;
  companyId: string;

  createdDate: string;
  createdAt: string;
  updatedAt: string;

  student?: {
    image?: string;
  } | null;
}

/* =========================================================
 * UI CONTRACT MODEL
 * ======================================================= */

export interface MappedContract {
  /* ids */
  id: string;
  contractNumber: string;
  shortContractId: string;

  /* student */
  studentName: string;
  studentImage?: string;

  /* contract */
  contractTitle: string;
  contractStatus: ContractStatus | string;

  currentStage: "running" | "evaluation" | "completed" | "disputed";

  /* dates */
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;

  /* finance */
  currency: string;
  monthlyAllowance?: number;
  salary?: number | null;
  salaryDisplay: string;

  /* progress */
  workProgress: number;
  hasReport?: boolean;

  /* extra */
  duration?: string;
  workLocation?: string;
  note?: string;
}