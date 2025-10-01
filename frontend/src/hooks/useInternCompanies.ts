import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { internCompanyService } from '@/services/internCompanyService'
import { useToast } from '@/components/ui/use-toast'

// Hook for getting intern companies
export function useInternCompanies(params?: {
  page?: number
  limit?: number
  status?: string
  industry?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery({
    queryKey: ['intern-companies', params],
    queryFn: () => internCompanyService.getInternCompanies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting intern company stats
export function useInternCompanyStats() {
  return useQuery({
    queryKey: ['intern-companies', 'stats'],
    queryFn: internCompanyService.getInternCompanyStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting company relationship details
export function useCompanyRelationship(companyId: string) {
  return useQuery({
    queryKey: ['intern-companies', 'relationship', companyId],
    queryFn: () => internCompanyService.getCompanyRelationship(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting work history timeline
export function useWorkHistoryTimeline() {
  return useQuery({
    queryKey: ['intern-companies', 'timeline'],
    queryFn: internCompanyService.getWorkHistoryTimeline,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting achievements
export function useAchievements() {
  return useQuery({
    queryKey: ['intern-companies', 'achievements'],
    queryFn: internCompanyService.getAchievements,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting skills gained
export function useSkillsGained() {
  return useQuery({
    queryKey: ['intern-companies', 'skills'],
    queryFn: internCompanyService.getSkillsGained,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting performance history
export function usePerformanceHistory() {
  return useQuery({
    queryKey: ['intern-companies', 'performance'],
    queryFn: internCompanyService.getPerformanceHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting recommendations
export function useRecommendations() {
  return useQuery({
    queryKey: ['intern-companies', 'recommendations'],
    queryFn: internCompanyService.getRecommendations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
