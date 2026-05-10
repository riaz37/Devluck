"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'

/* ──────────────────────────────────────────────
   UI TYPES
────────────────────────────────────────────── */
interface ContractData {
  contractTitle: string
  name: string
  inContractNumber: string
  inContractList?: string[]
  currency: string
  duration: string
  monthlyAllowance: number
  salary?: number | null
  workLocation?: string
  note?: string
  status: string
  workProgress?: number
  hasReport?: boolean
}

interface Contract extends ContractData {
  id: string
  companyId: string
  createdDate: string
  createdAt: string
  updatedAt: string
  student?: { image?: string } | null
}

interface ListContractsResponse {
  items: Contract[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ContractStats {
  total: number
  running: number
  completed: number
  other: number
}

interface Employee {
  id: string
  contractTitle: string
  contractNumber: string
  status: string
  student: {
    id: string
    name: string
    email: string
    image?: string
    profileComplete: number
    status: string
  } | null
}

/* ──────────────────────────────────────────────
   ✅ FIXED WITH STATS STATE
────────────────────────────────────────────── */
interface UseContractHandlerReturn {
  contracts: Contract[];
  contract: Contract | null;
  employees: Employee[];
  contractStatsData: ContractStats; // ✅ ADDED
  
  // ✅ SEPARATE LOADING STATES
  listLoading: boolean;
  statsLoading: boolean;
  actionLoading: boolean;
  error: string | null;

  createContract: (data: ContractData) => Promise<Contract>;
  updateContract: (id: string, data: Partial<ContractData>) => Promise<Contract>;
  deleteContract: (id: string) => Promise<void>;
  getContractById: (id: string) => Promise<Contract>;
  listContracts: (page?: number, pageSize?: number, search?: string, status?: string) => Promise<ListContractsResponse>;
  getContractStats: () => Promise<ContractStats>;
  getEmployees: () => Promise<Employee[]>;
  clearError: () => void;
  refetch: () => Promise<void>;
}

export const useContractHandler = (): UseContractHandlerReturn => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contractStatsData, setContractStatsData] = useState<ContractStats>({ // ✅ ADDED
    total: 0, running: 0, completed: 0, other: 0,
  });
  
  // ✅ SEPARATE LOADING STATES
  const [listLoading, setListLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /* ───────── CREATE ───────── */
  const createContract = useCallback(async (data: ContractData): Promise<Contract> => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await api.post<{ status: string; data: Contract }>('/company/contracts', data);
      setContracts(prev => [response.data.data, ...prev]);
      // ✅ Update stats
      setContractStatsData(prev => ({ ...prev, total: prev.total + 1 }));
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create contract';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, []);

  /* ───────── UPDATE ───────── */
  const updateContract = useCallback(
    async (id: string, data: Partial<ContractData>): Promise<Contract> => {
      setActionLoading(true);
      setError(null);
      try {
        const response = await api.put<{ status: string; data: Contract }>(`/company/contracts/${id}`, data);
        setContracts(prev => prev.map(c => c.id === id ? response.data.data : c));
        if (contract?.id === id) {
          setContract(response.data.data);
        }
        return response.data.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update contract';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    },
    [contract?.id]
  );

  /* ───────── DELETE ───────── */
  const deleteContract = useCallback(async (id: string): Promise<void> => {
    setActionLoading(true);
    setError(null);
    try {
      await api.delete(`/company/contracts/${id}`);
      setContracts(prev => prev.filter(c => c.id !== id));
      // ✅ Update stats
      setContractStatsData(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      if (contract?.id === id) {
        setContract(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete contract';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, [contract?.id]);

  /* ───────── GET BY ID ───────── */
  const getContractById = useCallback(async (id: string): Promise<Contract> => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await api.get<{ status: string; data: Contract }>(`/company/contracts/${id}`);
      setContract(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get contract';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, []);

  /* ───────── LIST ───────── */
  const listContracts = useCallback(
    async (page: number = 1, pageSize: number = 6, search?: string, status?: string): Promise<ListContractsResponse> => {
      setListLoading(true);
      setError(null);
      try {
        const params: any = { page: 1, pageSize: 1000 };
        if (search) params.search = search;

        const response = await api.get<{ status: string; data: ListContractsResponse }>('/company/contracts', { params });
        
        const items = response.data.data?.items || [];
        setContracts(items);
        
        return {
          ...response.data.data,
          items,
          total: items.length,
          totalPages: Math.ceil(items.length / pageSize),
        };
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to list contracts';
        setError(errorMessage);
        setContracts([]);
        throw new Error(errorMessage);
      } finally {
        setListLoading(false);
      }
    },
    []
  );

  /* ───────── STATS - ✅ FIXED WITH STATE UPDATE ───────── */
  const getContractStats = useCallback(async (): Promise<ContractStats> => {
    setStatsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ status: string; data: ContractStats }>('/company/contracts/stats');
      const stats = response.data.data;
      
      // ✅ UPDATE LOCAL STATE - THIS WAS MISSING!
      setContractStatsData(stats);
      
      return stats;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get contract statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ───────── EMPLOYEES ───────── */
  const getEmployees = useCallback(async (): Promise<Employee[]> => {
    setListLoading(true);
    setError(null);
    try {
      const response = await api.get<{ status: string; data: Employee[] }>('/company/contracts/employees');
      setEmployees(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get employees';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setListLoading(false);
    }
  }, []);

  /* ───────── REFETCH ───────── */
  const refetch = useCallback(async () => {
    await Promise.all([
      listContracts(1, 1000),
      getContractStats(),
    ]);
  }, [listContracts, getContractStats]);

  return {
    contracts,
    contract,
    employees,
    contractStatsData,     // ✅ NOW AVAILABLE
    listLoading,
    statsLoading,
    actionLoading,
    error,
    createContract,
    updateContract,
    deleteContract,
    getContractById,
    listContracts,
    getContractStats,
    getEmployees,
    clearError,
    refetch,
  };
};