import { api } from './api'

export interface InternCompany {
  _id: string
  intern: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  company: {
    _id: string
    name: string
    logo?: string
    industry: string
    location: string
    website?: string
    description?: string
    size?: string
  }
  job: {
    _id: string
    title: string
    department: string
    description: string
    type: 'full-time' | 'part-time' | 'contract' | 'internship'
  }
  status: 'active' | 'inactive' | 'terminated' | 'completed'
  startDate: string
  endDate?: string
  salary?: number
  hoursPerWeek?: number
  supervisor?: {
    _id: string
    name: string
    email: string
    role: string
  }
  performance?: {
    rating: number
    feedback: string
    lastReview: string
    totalReviews: number
  }
  achievements?: Array<{
    title: string
    description: string
    date: string
    category: 'technical' | 'leadership' | 'collaboration' | 'innovation'
  }>
  skills?: string[]
  projects?: Array<{
    name: string
    description: string
    technologies: string[]
    startDate: string
    endDate?: string
    status: 'completed' | 'in-progress' | 'on-hold'
  }>
  createdAt: string
  updatedAt: string
}

export interface InternCompanyStats {
  totalCompanies: number
  totalExperience: number // in months
  averageRating: number
  completedInternships: number
  activeInternships: number
  skillsGained: string[]
  industries: Array<{
    name: string
    count: number
    duration: number
  }>
  monthlyTimeline: Array<{
    month: string
    company: string
    position: string
    status: string
  }>
  achievements: Array<{
    category: string
    count: number
  }>
}

export interface CompanyRelationshipDetails {
  company: {
    _id: string
    name: string
    logo?: string
    industry: string
    location: string
    website?: string
    description?: string
    size?: string
    founded?: string
    employees?: number
  }
  relationship: InternCompany
  timeline: Array<{
    date: string
    event: string
    description: string
    type: 'start' | 'milestone' | 'achievement' | 'review' | 'end'
  }>
  performance: Array<{
    date: string
    rating: number
    feedback: string
    reviewer: string
    category: 'technical' | 'soft-skills' | 'leadership' | 'collaboration'
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
    startDate: string
    endDate?: string
    status: 'completed' | 'in-progress' | 'on-hold'
    impact?: string
  }>
  achievements: Array<{
    title: string
    description: string
    date: string
    category: 'technical' | 'leadership' | 'collaboration' | 'innovation'
    verified: boolean
  }>
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    verified: boolean
    verifiedBy: string
    verifiedDate: string
  }>
  recommendations: Array<{
    from: string
    role: string
    content: string
    date: string
    rating: number
  }>
}

export const internCompanyService = {
  // Get all companies an intern worked with
  async getInternCompanies(params?: {
    page?: number
    limit?: number
    status?: string
    industry?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    success: boolean
    count: number
    pagination: any
    data: InternCompany[]
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.industry) queryParams.append('industry', params.industry)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const response = await api.get(`/intern-companies?${queryParams.toString()}`)
    return response.data
  },

  // Get intern company statistics
  async getInternCompanyStats(): Promise<{
    success: boolean
    data: InternCompanyStats
  }> {
    const response = await api.get('/intern-companies/stats')
    return response.data
  },

  // Get detailed company relationship
  async getCompanyRelationship(companyId: string): Promise<{
    success: boolean
    data: CompanyRelationshipDetails
  }> {
    const response = await api.get(`/intern-companies/${companyId}`)
    return response.data
  },

  // Get work history timeline
  async getWorkHistoryTimeline(): Promise<{
    success: boolean
    data: Array<{
      date: string
      company: string
      position: string
      status: string
      duration: string
      rating?: number
    }>
  }> {
    const response = await api.get('/intern-companies/timeline')
    return response.data
  },

  // Get achievements
  async getAchievements(): Promise<{
    success: boolean
    data: Array<{
      title: string
      description: string
      date: string
      company: string
      category: string
      verified: boolean
    }>
  }> {
    const response = await api.get('/intern-companies/achievements')
    return response.data
  },

  // Get skills gained
  async getSkillsGained(): Promise<{
    success: boolean
    data: Array<{
      name: string
      level: string
      verified: boolean
      companies: string[]
      lastUsed: string
    }>
  }> {
    const response = await api.get('/intern-companies/skills')
    return response.data
  },

  // Get performance history
  async getPerformanceHistory(): Promise<{
    success: boolean
    data: Array<{
      company: string
      position: string
      rating: number
      feedback: string
      date: string
      reviewer: string
    }>
  }> {
    const response = await api.get('/intern-companies/performance')
    return response.data
  },

  // Get recommendations
  async getRecommendations(): Promise<{
    success: boolean
    data: Array<{
      from: string
      role: string
      company: string
      content: string
      date: string
      rating: number
    }>
  }> {
    const response = await api.get('/intern-companies/recommendations')
    return response.data
  }
}
