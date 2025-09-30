import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService, Review } from '@/services/reviewService'
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
