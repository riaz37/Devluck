import { useCallback, useState } from "react"
import { api } from "@/lib/api"

export interface RankingCompanySummary {
  id: string
  name: string
  industry: string | null
  website: string | null
  email: string | null
  logo: string | null
  status: string | null
  progress: number
  size: string | null
  foundedYear: number | null
  location: string | null
  address: string | null
  phoneNumber: string | null
  addresses: Array<{
    id: string
    name: string | null
    tag: string | null
    address: string | null
    phoneNumber: string | null
  }>
}

type RankingCompanyApi = RankingCompanySummary & {
  user?: { email?: string | null } | null
}

const mapRankingCompany = (company: RankingCompanyApi): RankingCompanySummary => {
  const { user, ...rest } = company
  return {
    ...rest,
    email: rest.email ?? user?.email ?? null
  }
}

export interface CompanyGlobalRanking {
  companyId: string
  finalScore: number
  globalRank: number
  classification: string
  opportunityScore: number
  contractsScore: number
  applicantsScore: number
  profileQualityScore: number
  hiringEfficiencyScore: number
  penaltyScore: number
  computedAt: string
  createdAt: string
  updatedAt: string
  company: RankingCompanySummary
}

export interface ListCompanyGlobalRankingsData {
  items: CompanyGlobalRanking[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ApiEnvelope<T> {
  status: string
  data: T
}

interface ListCompanyGlobalRankingsParams {
  page?: number
  limit?: number
  classification?: string
  search?: string
}

interface UseCompanyGlobalRankingHandlerReturn {
  rankings: CompanyGlobalRanking[]
  ranking: CompanyGlobalRanking | null
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  totalPages: number
  listCompanyGlobalRankings: (params?: ListCompanyGlobalRankingsParams) => Promise<ListCompanyGlobalRankingsData>
  getCompanyGlobalRankingByCompanyId: (companyId: string) => Promise<CompanyGlobalRanking>
  clearError: () => void
}

export const useCompanyGlobalRankingHandler = (): UseCompanyGlobalRankingHandlerReturn => {
  const [rankings, setRankings] = useState<CompanyGlobalRanking[]>([])
  const [ranking, setRanking] = useState<CompanyGlobalRanking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const listCompanyGlobalRankings = useCallback(
    async (params: ListCompanyGlobalRankingsParams = {}): Promise<ListCompanyGlobalRankingsData> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<ApiEnvelope<ListCompanyGlobalRankingsData>>("/api/rankings/companies", {
          params
        })

        const data = response.data.data
        const items = data.items.map((item) => ({
          ...item,
          company: mapRankingCompany(item.company as RankingCompanyApi)
        }))
        setRankings(items)
        setTotal(data.total)
        setPage(data.page)
        setPageSize(data.pageSize)
        setTotalPages(data.totalPages)
        return { ...data, items }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to fetch company rankings"
        setError(message)
        setRankings([])
        throw new Error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getCompanyGlobalRankingByCompanyId = useCallback(async (companyId: string): Promise<CompanyGlobalRanking> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get<ApiEnvelope<CompanyGlobalRanking>>(`/api/rankings/companies/${companyId}`)
      const raw = response.data.data
      const data: CompanyGlobalRanking = {
        ...raw,
        company: mapRankingCompany(raw.company as RankingCompanyApi)
      }
      setRanking(data)
      return data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch company ranking"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    rankings,
    ranking,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    listCompanyGlobalRankings,
    getCompanyGlobalRankingByCompanyId,
    clearError
  }
}
