"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface Opportunity {
  id: string
  title: string
  visibility?: string
  type: string
  timeLength: string
  currency: string
  allowance?: string
  location: "Onsite" | "Remote" | "Hybrid"
  details: string
  skills: string[]
  whyYouWillLoveWorkingHere: string[]
  benefits: string[]
  keyResponsibilities: string[]
  startDate?: string
  companyId: string
  hasAssessment?: boolean
  fitProfile?: string | null
  questionMode?: string
  assessmentDeadlineHours?: number
  company?: {
    id: string
    name: string
    logo?: string
    logoUrl?: string
    industry?: string
    location?: string
    website?: string
    description?: string
    phoneNumber?: string
  }
  applicationStatus?: {
    status: string
    applicationId: string
    appliedAt: string
  } | null
  createdAt: string
  updatedAt: string
}

interface ListOpportunitiesResponse {
  items: Opportunity[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface Question {
  id: string
  opportunityId: string
  question: string
  type: 'text' | 'select' | 'checkbox' | 'rating'
  options: string[]
  order: number
  isRequired: boolean
  createdAt: string
  updatedAt: string
}

interface UseStudentOpportunityHandlerReturn {
  opportunities: Opportunity[]
  opportunity: Opportunity | null
  loading: boolean
  error: string | null
  listOpportunities: (page?: number, pageSize?: number) => Promise<ListOpportunitiesResponse>
  getOpportunityById: (id: string) => Promise<Opportunity>
  getOpportunityQuestions: (opportunityId: string) => Promise<Question[]>
  clearError: () => void
}

export const useStudentOpportunityHandler = (): UseStudentOpportunityHandlerReturn => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listOpportunities = useCallback(
    async (page: number = 1, pageSize: number = 10): Promise<ListOpportunitiesResponse> => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<{ status: string; data: ListOpportunitiesResponse }>(
          '/api/student/opportunities',
          {
            params: { page, pageSize }
          }
        )
        console.log('[useStudentOpportunityHandler] API Response:', JSON.stringify(response.data, null, 2))
        const items = response.data.data?.items || []
        console.log('[useStudentOpportunityHandler] Extracted items:', items)
        console.log('[useStudentOpportunityHandler] Items count:', items.length)
        setOpportunities(items)
        return response.data.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to list opportunities'
        setError(errorMessage)
        setOpportunities([])
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getOpportunityById = useCallback(async (id: string): Promise<Opportunity> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Opportunity }>(
        `/api/student/opportunities/${id}`
      )
      setOpportunity(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get opportunity'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getOpportunityQuestions = useCallback(async (opportunityId: string): Promise<Question[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Question[] }>(
        `/api/student/opportunities/${opportunityId}/questions`
      )
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get questions'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    opportunities,
    opportunity,
    loading,
    error,
    listOpportunities,
    getOpportunityById,
    getOpportunityQuestions,
    clearError
  }
}

