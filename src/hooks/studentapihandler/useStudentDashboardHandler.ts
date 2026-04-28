"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


interface DashboardStats {
  totalOpportunities: number
  totalApplied: number
  totalRejected: number
}

interface UpcomingInterview {
  id: string
  interviewAt: string
  meetingLink: string
  notes?: string | null
  opportunity?: {
    id: string
    title: string
    companyId: string
  }
  company?: {
    id: string
    name: string
  }
}

interface UseStudentDashboardHandlerReturn {
  stats: DashboardStats | null
  interviews: UpcomingInterview[]
  loading: boolean
  error: string | null
  getDashboardStats: () => Promise<DashboardStats>
  getUpcomingInterviews: (studentId: string) => Promise<UpcomingInterview[]>
  clearError: () => void
}

export const useStudentDashboardHandler = (): UseStudentDashboardHandlerReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [interviews, setInterviews] = useState<UpcomingInterview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getDashboardStats = useCallback(async (): Promise<DashboardStats> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: DashboardStats }>('/api/student/dashboard/stats')
      setStats(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get dashboard stats'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getUpcomingInterviews = useCallback(async (studentId: string): Promise<UpcomingInterview[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: UpcomingInterview[] }>(`/api/interviews/student/${studentId}`)
      const data = response.data.data || []
      setInterviews(data)
      return data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get upcoming interviews'
      setError(errorMessage)
      setInterviews([])
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    interviews,
    loading,
    error,
    getDashboardStats,
    getUpcomingInterviews,
    clearError
  }
}


