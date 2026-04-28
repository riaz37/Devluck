"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


export interface Question {
  id: string
  opportunityId: string
  question: string
  type: 'text' | 'select' | 'checkbox' | 'rating'
  dimension?: string
  evaluationHint?: string
  options: string[]
  order: number
  isRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface QuestionData {
  question: string
  type: 'text' | 'select' | 'checkbox' | 'rating'
  dimension?: string
  evaluationHint?: string
  options?: string[]
  order?: number
  isRequired?: boolean
}

interface UseQuestionHandlerReturn {
  questions: Question[]
  loading: boolean
  error: string | null
  getQuestions: (opportunityId: string) => Promise<Question[]>
  createQuestion: (opportunityId: string, data: QuestionData) => Promise<Question>
  updateQuestion: (opportunityId: string, questionId: string, data: Partial<QuestionData>) => Promise<Question>
  deleteQuestion: (opportunityId: string, questionId: string) => Promise<void>
  bulkUpdateQuestions: (opportunityId: string, questions: (QuestionData & { id?: string })[]) => Promise<Question[]>
  clearError: () => void
}

export const useQuestionHandler = (): UseQuestionHandlerReturn => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getQuestions = useCallback(async (opportunityId: string): Promise<Question[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{ status: string; data: Question[] }>(
        `/api/company/opportunities/${opportunityId}/questions`
      )
      setQuestions(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get questions'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createQuestion = useCallback(async (opportunityId: string, data: QuestionData): Promise<Question> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<{ status: string; data: Question }>(
        `/api/company/opportunities/${opportunityId}/questions`,
        data
      )
      setQuestions(prev => [...prev, response.data.data])
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create question'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateQuestion = useCallback(async (
    opportunityId: string,
    questionId: string,
    data: Partial<QuestionData>
  ): Promise<Question> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put<{ status: string; data: Question }>(
        `/api/company/opportunities/${opportunityId}/questions/${questionId}`,
        data
      )
      setQuestions(prev => prev.map(q => q.id === questionId ? response.data.data : q))
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update question'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteQuestion = useCallback(async (opportunityId: string, questionId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/api/company/opportunities/${opportunityId}/questions/${questionId}`)
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete question'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkUpdateQuestions = useCallback(async (
    opportunityId: string,
    questionsData: (QuestionData & { id?: string })[]
  ): Promise<Question[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put<{ status: string; data: Question[] }>(
        `/api/company/opportunities/${opportunityId}/questions`,
        { questions: questionsData }
      )
      setQuestions(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update questions'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    questions,
    loading,
    error,
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUpdateQuestions,
    clearError
  }
}

