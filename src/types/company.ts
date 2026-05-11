export interface CompanyAddress {
  id: string
  name?: string
  tag?: string
  address?: string
  phoneNumber?: string
}

export interface TopCompany {
  id: string
  name: string
  email?: string | null
  globalRank?: number | null
  logo?: string | null
  image?: string | null
  address?: string | null
  phoneNumber?: string | null
  status?: string | null
  industry?: string | null
  location?: string | null
  website?: string | null
  description?: string | null
  size?: string | null
  employeeNumber?: number | null
  contractsCount?: number
  addresses?: CompanyAddress[]
  opportunityCount: number
}