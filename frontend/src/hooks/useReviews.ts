import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, CreateReviewRequest, UpdateReviewRequest } from '@/services/reviewService';

// Hook for getting all reviews with pagination and filtering
export function useReviews(params?: {
  page?: number;
  limit?: number;
  sort?: string;
  target?: string;
  reviewer?: string;
  rating?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewService.getReviews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting reviews about the current user (for interns)
export function useReviewsAboutMe() {
  return useQuery({
    queryKey: ['reviewsAboutMe'],
    queryFn: () => reviewService.getReviewsAboutMe(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for getting reviews by the current user (reviews they wrote)
export function useMyReviews() {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => reviewService.getMyReviews(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for getting reviews for a specific target user
export function useReviewsForTarget(targetId: string, type: 'all' | 'company' | 'intern' = 'all') {
  return useQuery({
    queryKey: ['reviewsForTarget', targetId, type],
    queryFn: () => reviewService.getReviewsForTarget(targetId, type),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a review
export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsAboutMe'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Hook for updating a review
export function useUpdateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewRequest }) => 
      reviewService.updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsAboutMe'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Hook for deleting a review
export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsAboutMe'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Hook for creating a company review (intern reviewing company)
export function useCreateCompanyReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: { rating: number; feedback: string } }) => 
      reviewService.createCompanyReview(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsAboutMe'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Hook for creating an intern review (company reviewing intern)
export function useCreateInternReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ internId, jobId, data }: { internId: string; jobId: string; data: { rating: number; feedback: string } }) => 
      reviewService.createInternReview(internId, jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsAboutMe'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Hook for getting company's intern reviews
export function useCompanyInternReviews() {
  return useQuery({
    queryKey: ['companyInternReviews'],
    queryFn: () => reviewService.getCompanyInternReviews(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}