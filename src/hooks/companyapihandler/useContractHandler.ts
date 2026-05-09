"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


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

interface UseContractHandlerReturn {
  contracts: Contract[]
  contract: Contract | null
  employees: Employee[]
  loading: boolean
  error: string | null
  createContract: (data: ContractData) => Promise<Contract>
  updateContract: (id: string, data: Partial<ContractData>) => Promise<Contract>
  deleteContract: (id: string) => Promise<void>
  getContractById: (id: string) => Promise<Contract>
  listContracts: (page?: number, pageSize?: number, search?: string, status?: string) => Promise<ListContractsResponse>
  getContractStats: () => Promise<ContractStats>
  getEmployees: () => Promise<Employee[]>
  clearError: () => void
}

export const useContractHandler = (): UseContractHandlerReturn => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contract, setContract] = useState<Contract | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const createContract = useCallback(async (data: ContractData): Promise<Contract> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: Contract }>('/company/contracts', data)
      setContracts(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to create contract'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateContract = useCallback(
    async (id: string, data: Partial<ContractData>): Promise<Contract> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.put<{ status: string; data: Contract }>(`/company/contracts/${id}`, data)
        setContracts(prev => prev.map(c => c.id === id ? response.data.data : c))
        if (contract?.id === id) {
          setContract(response.data.data)
        }
        return response.data.data
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to update contract'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [contract]
  )

  const deleteContract = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/company/contracts/${id}`)
      setContracts(prev => prev.filter(c => c.id !== id))
      if (contract?.id === id) {
        setContract(null)
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to delete contract'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [contract])

  const getContractById = useCallback(async (id: string): Promise<Contract> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Contract }>(`/company/contracts/${id}`)
      setContract(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get contract'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const listContracts = useCallback(
    async (page: number = 1, pageSize: number = 6, search?: string, status?: string): Promise<ListContractsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, pageSize }
        if (search) params.search = search
        if (status) params.status = status

        const response = await api.get<{ status: string; data: ListContractsResponse }>('/company/contracts', {
          params
        })
        const items = response.data.data?.items || []
        setContracts(items)
        return response.data.data
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to list contracts'
        setError(errorMessage)
        setContracts([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getContractStats = useCallback(async (): Promise<ContractStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: ContractStats }>('/company/contracts/stats')
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get contract statistics'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getEmployees = useCallback(async (): Promise<Employee[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Employee[] }>('/company/contracts/employees')
      setEmployees(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get employees'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    contracts,
    contract,
    employees,
    loading,
    error,
    createContract,
    updateContract,
    deleteContract,
    getContractById,
    listContracts,
    getContractStats,
    getEmployees,
    clearError
  }
}

