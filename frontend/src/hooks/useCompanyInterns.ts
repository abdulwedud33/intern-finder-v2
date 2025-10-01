import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyInternService, UpdateStatusRequest, TerminateInternRequest } from '@/services/companyInternService'
import { useToast } from '@/components/ui/use-toast'

// Hook for getting company interns
export function useCompanyInterns(params?: {
  page?: number
  limit?: number
  status?: string
  department?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery({
    queryKey: ['company-interns', params],
    queryFn: () => companyInternService.getCompanyInterns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting company intern stats
export function useCompanyInternStats() {
  return useQuery({
    queryKey: ['company-interns', 'stats'],
    queryFn: companyInternService.getCompanyInternStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting single company intern
export function useCompanyIntern(internId: string) {
  return useQuery({
    queryKey: ['company-interns', internId],
    queryFn: () => companyInternService.getCompanyIntern(internId),
    enabled: !!internId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for updating intern status
export function useUpdateInternStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ internId, data }: { internId: string; data: UpdateStatusRequest }) =>
      companyInternService.updateInternStatus(internId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['company-interns'] })
      toast({
        title: "Status updated",
        description: response.message || "Intern status has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    },
  })
}

// Hook for terminating intern
export function useTerminateIntern() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ internId, data }: { internId: string; data: TerminateInternRequest }) =>
      companyInternService.terminateIntern(internId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['company-interns'] })
      toast({
        title: "Intern terminated",
        description: response.message || "Intern has been terminated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to terminate intern",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    },
  })
}

// Hook for getting intern performance
export function useInternPerformance(internId: string) {
  return useQuery({
    queryKey: ['company-interns', internId, 'performance'],
    queryFn: () => companyInternService.getInternPerformance(internId),
    enabled: !!internId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for adding performance review
export function useAddPerformanceReview() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ internId, data }: { 
      internId: string; 
      data: {
        rating: number
        feedback: string
        strengths: string[]
        improvements: string[]
      }
    }) => companyInternService.addPerformanceReview(internId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['company-interns'] })
      toast({
        title: "Performance review added",
        description: response.message || "Performance review has been added successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add review",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    },
  })
}
