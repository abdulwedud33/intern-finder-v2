import { api } from './api'

export interface Review {
  _id: string
  rating: number
  content: string
  feedback?: string
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

export interface CreateReviewRequest {
  target: string
  targetModel: 'Intern' | 'Company'
  rating: number
  content: string
  feedback?: string
  job?: string
  direction: 'company_to_intern' | 'intern_to_company'
}

export interface UpdateReviewRequest {
  rating?: number
  content?: string
  feedback?: string
}

export interface ReviewsResponse {
  success: boolean
  count: number
  averageRating: number
  data: Review[]
}

export const reviewService = {
  // Get all reviews with pagination and filtering
  getReviews: async (params?: {
    page?: number
    limit?: number
    sort?: string
    target?: string
    reviewer?: string
    rating?: number
    status?: string
  }): Promise<{
    success: boolean
    count: number
    pagination: any
    data: Review[]
  }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.target) queryParams.append('target', params.target)
    if (params?.reviewer) queryParams.append('reviewer', params.reviewer)
    if (params?.rating) queryParams.append('rating', params.rating.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const response = await api.get(`/reviews?${queryParams.toString()}`)
    return response.data
  },

  // Get a single review by ID
  getReview: async (reviewId: string): Promise<{ success: boolean; data: Review }> => {
    const response = await api.get(`/reviews/${reviewId}`)
    return response.data
  },

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

  // Create a new review
  createReview: async (data: CreateReviewRequest): Promise<{ success: boolean; data: Review }> => {
    const response = await api.post('/reviews', data)
    return response.data
  },

  // Update an existing review
  updateReview: async (reviewId: string, data: UpdateReviewRequest): Promise<{ success: boolean; data: Review }> => {
    const response = await api.put(`/reviews/${reviewId}`, data)
    return response.data
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
  },

  // Create or update a company review (intern reviewing company)
  createCompanyReview: async (companyId: string, data: { rating: number; feedback: string }): Promise<Review> => {
    // Map feedback to content for backend
    const backendData = {
      rating: data.rating,
      content: data.feedback,
      feedback: data.feedback
    };
    const response = await api.post(`/reviews/company-reviews/${companyId}`, backendData)
    return response.data.data
  },

  // Create or update an intern review (company reviewing intern)
  createInternReview: async (internId: string, jobId: string, data: { rating: number; feedback: string }): Promise<Review> => {
    // Map feedback to content for backend
    const backendData = {
      rating: data.rating,
      content: data.feedback,
      feedback: data.feedback
    };
    const response = await api.post(`/reviews/intern-reviews/${internId}/${jobId}`, backendData)
    return response.data.data
  },

  // Get company's intern reviews
  getCompanyInternReviews: async (): Promise<{ success: boolean; data: Review[] }> => {
    const response = await api.get('/reviews/intern-reviews')
    return response.data
  }
}
