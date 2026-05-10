"use client";

import { api } from "@/lib/api";
import { useState, useCallback } from "react";

/* ──────────────────────────────────────────────
   UI TYPES (STRICT - SAFE FOR COMPONENTS)
────────────────────────────────────────────── */
export type ContractStatus = "Active" | "Inactive" | "Draft";
export type WorkLocation = "Hybrid" | "Remote" | "Onsite";

export interface ContractTemplate {
  id: string;
  name: string;
  contractTitle: string;
  content?: string;
  currency: string;
  duration: string;
  monthlyAllowance?: string;
  workLocation: WorkLocation;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  salaryDisplay?: string;
}

/* ──────────────────────────────────────────────
   DTO (RAW API - UNSAFE)
────────────────────────────────────────────── */
interface ContractTemplateDTO {
  id?: string;
  name?: string;
  contractTitle?: string;
  content?: string;
  currency?: string;
  duration?: string;
  monthlyAllowance?: string | number;  // ✅ Fixed: allow number too
  workLocation?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ListContractTemplatesResponse {
  items: ContractTemplateDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ContractTemplateStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  latestActive: string | null;
  latestInactive: string | null;
  latestDraft: string | null;
  latest: string | null;
}

/* ──────────────────────────────────────────────
   RETURN TYPE - ✅ FIXED WITH SEPARATE LOADERS
────────────────────────────────────────────── */
interface UseContractTemplateHandlerReturn {
  contractTemplates: ContractTemplate[];
  contractTemplate: ContractTemplate | null;
  
  // ✅ SEPARATE LOADING STATES
  listLoading: boolean;
  statsLoading: boolean;
  actionLoading: boolean;
  error: string | null;

  createContractTemplate: (
    data: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">
  ) => Promise<ContractTemplate>;

  updateContractTemplate: (
    id: string,
    data: Partial<ContractTemplate>
  ) => Promise<ContractTemplate>;

  deleteContractTemplate: (id: string) => Promise<void>;

  getContractTemplateById: (id: string) => Promise<ContractTemplate>;

  listContractTemplates: (
    page?: number,
    pageSize?: number,
    search?: string,
    status?: string[]  // ✅ Added for server-side filtering
  ) => Promise<ListContractTemplatesResponse>;

  getContractTemplateStats: () => Promise<ContractTemplateStats>;

  clearError: () => void;
  refetch: () => Promise<void>;  // ✅ Bonus: manual refetch
}

/* ──────────────────────────────────────────────
   GUARDS
────────────────────────────────────────────── */
const isWorkLocation = (v: string): v is WorkLocation =>
  ["Hybrid", "Remote", "Onsite"].includes(v);

const isContractStatus = (v: string): v is ContractStatus =>
  ["Active", "Inactive", "Draft"].includes(v);

/* ──────────────────────────────────────────────
   MAPPER - ✅ SYNTAX ERROR FIXED
────────────────────────────────────────────── */
const normalize = (dto: ContractTemplateDTO): ContractTemplate => {
  if (!dto.id) throw new Error("ContractTemplate missing id");

  const formatCompactNumber = (value: number) => {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }

    if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }

    return value.toString();
  };

  const workLocationRaw = dto.workLocation ?? "";
  const statusRaw = dto.status ?? "";

  const workLocation: WorkLocation = isWorkLocation(workLocationRaw)
    ? workLocationRaw
    : "Hybrid";

  const status: ContractStatus = isContractStatus(statusRaw)
    ? statusRaw
    : "Draft";

  const currency = dto.currency ?? "USD";

  // ✅ single safe numeric conversion
  const allowanceNumber =
    dto.monthlyAllowance !== undefined && dto.monthlyAllowance !== null
      ? Number(dto.monthlyAllowance)
      : NaN;

  const hasValidAllowance = !Number.isNaN(allowanceNumber);

  return {
    id: dto.id,
    name: dto.name?.trim() || "Untitled Template",
    contractTitle: dto.contractTitle?.trim() || "Untitled Contract",
    content: dto.content,
    currency,
    duration: dto.duration ?? "N/A",
    monthlyAllowance:
      dto.monthlyAllowance !== undefined && dto.monthlyAllowance !== null
        ? String(dto.monthlyAllowance)
        : undefined,

    workLocation,
    status,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    updatedAt: dto.updatedAt ?? new Date().toISOString(),

    salaryDisplay: hasValidAllowance
      ? `${currency} ${formatCompactNumber(allowanceNumber)}`
      : "N/A",
  };
};

/* ──────────────────────────────────────────────
   HOOK - ✅ FULLY FIXED
────────────────────────────────────────────── */
export const useContractTemplateHandler = (): UseContractTemplateHandlerReturn => {
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [contractTemplate, setContractTemplate] = useState<ContractTemplate | null>(null);
  
  // ✅ SEPARATE LOADING STATES
  const [listLoading, setListLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /* ───────── CREATE ───────── */
  const createContractTemplate = useCallback(
    async (
      data: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">
    ): Promise<ContractTemplate> => {
      setActionLoading(true);
      setError(null);

      try {
        const response = await api.post<{ status: string; data: ContractTemplateDTO }>(
          "/company/contract-templates",
          data
        );

        const created = normalize(response.data.data);

        return created;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to create contract template";

        setError(msg);
        throw new Error(msg);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  /* ───────── UPDATE ───────── */
  const updateContractTemplate = useCallback(
    async (id: string, data: Partial<ContractTemplate>): Promise<ContractTemplate> => {
      setActionLoading(true);
      setError(null);

      try {
        const response = await api.put<{ status: string; data: ContractTemplateDTO }>(
          `/company/contract-templates/${id}`,
          data
        );

        const updated = normalize(response.data.data);

        return updated;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to update contract template";

        setError(msg);
        throw new Error(msg);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  /* ───────── DELETE ───────── */
  const deleteContractTemplate = useCallback(
    async (id: string): Promise<void> => {
      setActionLoading(true);
      setError(null);

      try {
        await api.delete(`/company/contract-templates/${id}`);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete contract template";

        setError(msg);
        throw new Error(msg);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );


  /* ───────── GET BY ID ───────── */
  const getContractTemplateById = useCallback(async (id: string): Promise<ContractTemplate> => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await api.get<{ status: string; data: ContractTemplateDTO }>(
        `/company/contract-templates/${id}`
      );
      const normalized = normalize(response.data.data);
      setContractTemplate(normalized);
      return normalized;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to get contract template";
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const PAGE_SIZE = 6; // ✅ Moved to constant for easy reuse

  /* ───────── LIST - ✅ CLIENT-SIDE FILTERING ONLY ───────── */
  const listContractTemplates = useCallback(
    async (
      page: number = 1,
      pageSize: number = PAGE_SIZE, 
      search: string = "",
      status?: string[]  // ✅ Still accepts but IGNORES server-side filtering
    ): Promise<ListContractTemplatesResponse> => {
      setListLoading(true);
      setError(null);

      try {
        // ✅ NO status param sent to server - pure client-side filtering
        const params: any = { page, pageSize };
        if (search) params.search = search;

        const response = await api.get<{
          status: string;
          data: ListContractTemplatesResponse;
        }>("/company/contract-templates", { params });

        // ✅ Store ALL items for client-side filtering
        const allItems = response.data.data?.items.map(normalize) || [];
        setContractTemplates(allItems);

        // ✅ Return original response structure
        return {
          ...response.data.data,
          items: allItems, // normalized items
        };
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Failed to list contract templates";
        setError(msg);
        setContractTemplates([]);
        throw new Error(msg);
      } finally {
        setListLoading(false);
      }
    },
    []
  );

  /* ───────── STATS ───────── */
  const getContractTemplateStats = useCallback(async (): Promise<ContractTemplateStats> => {
    setStatsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        status: string;
        data: ContractTemplateStats;
      }>("/company/contract-templates/stats");

      return response.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to get contract template stats";
      setError(msg);
      throw new Error(msg);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ───────── REFETCH - BONUS UTILITY ───────── */
  const refetch = useCallback(
    async (page: number = 1, pageSize: number = PAGE_SIZE, search: string = "", status?: string[]) => {
      await Promise.all([
        listContractTemplates(page, pageSize, search, status),
        getContractTemplateStats(),
      ]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ✅ intentionally empty — listContractTemplates & getContractTemplateStats are stable
  );

  return {
    contractTemplates,
    contractTemplate,
    listLoading,      // ✅ List-specific
    statsLoading,     // ✅ Stats-specific  
    actionLoading,    // ✅ Create/update/delete-specific
    error,
    createContractTemplate,
    updateContractTemplate,
    deleteContractTemplate,
    getContractTemplateById,
    listContractTemplates,
    getContractTemplateStats,
    clearError,
    refetch,          // ✅ Bonus
  };
};