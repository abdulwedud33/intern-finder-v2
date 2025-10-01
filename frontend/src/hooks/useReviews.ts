import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService, Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/reviewService'
import { useToast } from '@/components/ui/use-toast'

export const useReviewsAboutMe = () => {
  return useQuery({
    queryKey: ['reviews', 'about-me'],
    queryFn: reviewService.getReviewsAboutMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useMyReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'my-reviews'],
    queryFn: reviewService.getMyReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useReviewsForTarget = (targetId: string, type: 'all' | 'company' | 'intern' = 'all') => {
  return useQuery({
    queryKey: ['reviews', 'target', targetId, type],
    queryFn: () => reviewService.getReviewsForTarget(targetId, type),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateCompanyReview = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: { rating: number; feedback: string } }) =>
      reviewService.createCompanyReview(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      })
    },
  })
}

export const useCreateInternReview = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ internId, jobId, data }: { internId: string; jobId: string; data: { rating: number; feedback: string } }) =>
      reviewService.createInternReview(internId, jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      })
    },
  })
}

// Get all reviews with filtering
export const useReviews = (params?: {
  page?: number
  limit?: number
  sort?: string
  target?: string
  reviewer?: string
  rating?: number
  status?: string
}) => {
  return useQuery({
    queryKey: ['reviews', 'all', params],
    queryFn: () => reviewService.getReviews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get a single review
export const useReview = (reviewId: string) => {
  return useQuery({
    queryKey: ['reviews', 'single', reviewId],
    queryFn: () => reviewService.getReview(reviewId),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create a new review
export const useCreateReview = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast({
        title: "Review created",
        description: "Your review has been created successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create review",
        variant: "destructive",
      })
    },
  })
}

// Update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewRequest }) =>
      reviewService.updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update review",
        variant: "destructive",
      })
    },
  })
}

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete review",
        variant: "destructive",
      })
    },
  })
}

// Get company's intern reviews
export const useCompanyInternReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'company-intern'],
    queryFn: reviewService.getCompanyInternReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
