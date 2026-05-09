"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface Contract {
  id: string
  contractTitle: string
  name: string
  createdDate: string
  inContractNumber: string
  inContractList: string[]
  currency: string
  duration: number
  monthlyAllowance: number
  salary?: number
  workLocation: string
  note?: string
  status: string
  companyId: string
  opportunityId?: string
  workProgress?: number
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
  }
  opportunity?: {
    id: string
    title: string
    details: string
    skills: string[]
    benefits: string[]
    keyResponsibilities: string[]
    whyYouWillLoveWorkingHere: string[]
    location?: string
    type?: string
    timeLength?: string
    currency?: string
    allowance?: string
  }
  createdAt: string
  updatedAt: string
}

interface ListContractsResponse {
  items: Contract[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UseStudentContractHandlerReturn {
  contracts: Contract[]
  contract: Contract | null
  loading: boolean
  error: string | null
  listContracts: (page?: number, pageSize?: number, status?: string) => Promise<ListContractsResponse>
  getContractById: (id: string) => Promise<Contract>
  clearError: () => void
}

export const useStudentContractHandler = (): UseStudentContractHandlerReturn => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listContracts = useCallback(
    async (page: number = 1, pageSize: number = 10, status?: string): Promise<ListContractsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, pageSize }
        if (status) params.status = status

        const response = await api.get<{ status: string; data: ListContractsResponse }>('/api/student/contracts', {
          params
        })
        const items = response.data.data?.items || []
        setContracts(items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to get contracts'
        setError(errorMessage)
        setContracts([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getContractById = useCallback(async (id: string): Promise<Contract> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Contract }>(`/api/student/contracts/${id}`)
      setContract(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get contract'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    contracts,
    contract,
    loading,
    error,
    listContracts,
    getContractById,
    clearError
  }
}

