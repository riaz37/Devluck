"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface Payment {
  id: string
  applicantId?: string
  applicantName: string
  contractId?: string
  transferId?: string
  nextPayment: string
  amount: number
  currency: string
  amountUsd: number
  note?: string
  paymentStatus: string
  companyId: string
  studentId?: string
  createdAt: string
  updatedAt: string
  contract?: {
    id: string
    contractTitle: string
    inContractNumber: string
  }
  company?: {
    id: string
    name: string
    logo?: string
  }
}

interface ListPaymentsResponse {
  items: Payment[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UseStudentPaymentHandlerReturn {
  payments: Payment[]
  loading: boolean
  error: string | null
  listPayments: (page?: number, pageSize?: number, contractId?: string) => Promise<ListPaymentsResponse>
  clearError: () => void
}

export const useStudentPaymentHandler = (): UseStudentPaymentHandlerReturn => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listPayments = useCallback(
    async (page: number = 1, pageSize: number = 10, contractId?: string): Promise<ListPaymentsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, pageSize }
        if (contractId) params.contractId = contractId

        const response = await api.get<{ status: string; data: ListPaymentsResponse }>('/api/student/payments', {
          params
        })
        const items = response.data.data?.items || []
        setPayments(items)
        return response.data.data
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to list payments'
        setError(errorMessage)
        setPayments([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    payments,
    loading,
    error,
    listPayments,
    clearError
  }
}

