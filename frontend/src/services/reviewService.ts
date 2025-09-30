import { api } from './api'

export interface Review {
  _id: string
  rating: number
  content: string
  reviewer: {
    _id: string
    name: string
    avatar?: string
    role: string
  }
  target: {
    _id: string
    name: string
    avatar?: string
    role: string
  }
  job?: {
    _id: string
    title: string
    company: string
  }
  direction: 'company_to_intern' | 'intern_to_company'
  targetModel: 'Intern' | 'Company'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface ReviewsResponse {
  success: boolean
  count: number
  averageRating: number
  data: Review[]
}

export const reviewService = {
  // Get reviews about the current user (for interns)
  getReviewsAboutMe: async (): Promise<ReviewsResponse> => {
    const response = await api.get('/reviews/about-me')
    return response.data
  },

  // Get reviews by the current user (reviews they wrote)
  getMyReviews: async (): Promise<ReviewsResponse> => {
    const response = await api.get('/reviews/me')
    return response.data
  },

  // Get reviews for a specific target user
  getReviewsForTarget: async (targetId: string, type: 'all' | 'company' | 'intern' = 'all'): Promise<ReviewsResponse> => {
    const response = await api.get(`/reviews/target/${targetId}?type=${type}`)
    return response.data
  },

  // Create or update a company review (intern reviewing company)
  createCompanyReview: async (companyId: string, data: { rating: number; feedback: string }): Promise<Review> => {
    const response = await api.post(`/reviews/company-reviews/${companyId}`, data)
    return response.data.data
  },

  // Create or update an intern review (company reviewing intern)
  createInternReview: async (internId: string, jobId: string, data: { rating: number; feedback: string }): Promise<Review> => {
    const response = await api.post(`/reviews/intern-reviews/${internId}/${jobId}`, data)
    return response.data.data
  }
}
