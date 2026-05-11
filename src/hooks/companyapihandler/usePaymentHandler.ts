"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface PaymentData {
  applicantName: string
  contractId?: string
  nextPayment: string
  amount: number
  currency: string
  note?: string
  paymentStatus: string
}

interface Payment extends PaymentData {
  id: string
  amountUsd: number
  applicantId?: string | null
  transferId?: string | null
  companyId: string
  createdAt: string
  updatedAt: string
}

interface ListPaymentsResponse {
  items: Payment[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PaymentStats {
  totalPaid: {
    amount: number
    count: number
  }
  pending: {
    amount: number
    count: number
  }
  due: {
    amount: number
    count: number
  }
}

interface UsePaymentHandlerReturn {
  payments: Payment[]
  payment: Payment | null
  loading: boolean
  error: string | null
  createPayment: (data: PaymentData) => Promise<Payment>
  updatePayment: (id: string, data: PaymentData) => Promise<Payment>
  listPayments: (page?: number, pageSize?: number, search?: string, status?: string, contractId?: string) => Promise<ListPaymentsResponse>
  getPaymentStats: (contractId: string) => Promise<PaymentStats>
  getCompanyPaymentStats: () => Promise<PaymentStats>
  deletePayment: (id: string) => Promise<void>
  clearError: () => void
}

export const usePaymentHandler = (): UsePaymentHandlerReturn => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const createPayment = useCallback(async (data: PaymentData): Promise<Payment> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: Payment }>('/company/payments', data)
      setPayments(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to create payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const listPayments = useCallback(
    async (page: number = 1, pageSize: number = 10, search?: string, status?: string, contractId?: string): Promise<ListPaymentsResponse> => {
      setLoading(true)
      setError(null)
      try {
        const params: any = { page, pageSize }
        if (search) params.search = search
        if (status) params.status = status
        if (contractId) params.contractId = contractId

        const response = await api.get<{ status: string; data: ListPaymentsResponse }>('/company/payments', {
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

  const updatePayment = useCallback(async (id: string, data: PaymentData): Promise<Payment> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put<{ status: string; data: Payment }>(`/company/payments/${id}`, data)
      setPayments(prev => prev.map(p => p.id === id ? response.data.data : p))
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentStats = useCallback(async (contractId: string): Promise<PaymentStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: PaymentStats }>('/company/payments/stats', {
        params: { contractId }
      })
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get payment statistics'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getCompanyPaymentStats = useCallback(async (): Promise<PaymentStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: PaymentStats }>('/company/payments/stats/company')
      return response.data.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to get company payment statistics'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePayment = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete<{ status: string; message: string }>(`/company/payments/${id}`)
      setPayments(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to delete payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    payments,
    payment,
    loading,
    error,
    createPayment,
    updatePayment,
    listPayments,
    getPaymentStats,
    getCompanyPaymentStats,
    deletePayment,
    clearError
  }
}

