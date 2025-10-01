import { api } from './api'

export interface CompanyIntern {
  _id: string
  intern: {
    _id: string
    name: string
    email: string
    avatar?: string
    phone?: string
    location?: string
    skills: string[]
    experience: string
    education: string
  }
  company: {
    _id: string
    name: string
    logo?: string
    industry: string
    location: string
  }
  job: {
    _id: string
    title: string
    department: string
    description: string
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
  }
  performance?: {
    rating: number
    feedback: string
    lastReview: string
  }
  createdAt: string
  updatedAt: string
}

export interface CompanyInternStats {
  total: number
  active: number
  inactive: number
  terminated: number
  completed: number
  averageRating: number
  departments: Array<{
    name: string
    count: number
  }>
  monthlyTrend: Array<{
    month: string
    count: number
  }>
}

export interface UpdateStatusRequest {
  status: 'active' | 'inactive' | 'terminated' | 'completed'
  reason?: string
  endDate?: string
}

export interface TerminateInternRequest {
  reason: string
  endDate: string
  feedback?: string
}

export const companyInternService = {
  // Get all interns in a company
  async getCompanyInterns(params?: {
    page?: number
    limit?: number
    status?: string
    department?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    success: boolean
    count: number
    pagination: any
    data: CompanyIntern[]
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.department) queryParams.append('department', params.department)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const response = await api.get(`/company-interns?${queryParams.toString()}`)
    return response.data
  },

  // Get company intern statistics
  async getCompanyInternStats(): Promise<{
    success: boolean
    data: CompanyInternStats
  }> {
    const response = await api.get('/company-interns/stats')
    return response.data
  },

  // Get single company intern relationship
  async getCompanyIntern(internId: string): Promise<{
    success: boolean
    data: CompanyIntern
  }> {
    const response = await api.get(`/company-interns/${internId}`)
    return response.data
  },

  // Update intern status
  async updateInternStatus(internId: string, data: UpdateStatusRequest): Promise<{
    success: boolean
    data: CompanyIntern
    message: string
  }> {
    const response = await api.put(`/company-interns/${internId}/status`, data)
    return response.data
  },

  // Terminate intern
  async terminateIntern(internId: string, data: TerminateInternRequest): Promise<{
    success: boolean
    data: CompanyIntern
    message: string
  }> {
    const response = await api.put(`/company-interns/${internId}/terminate`, data)
    return response.data
  },

  // Get intern performance history
  async getInternPerformance(internId: string): Promise<{
    success: boolean
    data: Array<{
      date: string
      rating: number
      feedback: string
      reviewer: string
    }>
  }> {
    const response = await api.get(`/company-interns/${internId}/performance`)
    return response.data
  },

  // Add performance review
  async addPerformanceReview(internId: string, data: {
    rating: number
    feedback: string
    strengths: string[]
    improvements: string[]
  }): Promise<{
    success: boolean
    data: any
    message: string
  }> {
    const response = await api.post(`/company-interns/${internId}/performance`, data)
    return response.data
  }
}
