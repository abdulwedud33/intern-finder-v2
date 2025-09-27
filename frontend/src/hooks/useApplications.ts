import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  applyToListing,
  getMyApplications,
  getCompanyApplications,
  getApplicationById,
  updateApplication,
  scheduleInterview,
  type ApplicationData,
  type InterviewData,
} from "@/services/applicationsService"
import { toast } from "sonner"

// Query keys
export const applicationKeys = {
  all: ['applications'] as const,
  myApplications: () => [...applicationKeys.all, 'my'] as const,
  companyApplications: () => [...applicationKeys.all, 'company'] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
}

// Get logged-in intern's applications
export function useMyApplications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...applicationKeys.myApplications(), params],
    queryFn: () => getMyApplications(params),
  })
}

// Get company's received applications
export function useCompanyApplications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...applicationKeys.companyApplications(), params],
    queryFn: () => getCompanyApplications(params),
  })
}

// Get single application detail
export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplicationById(id),
    enabled: !!id,
  })
}

// Apply to listing mutation
export function useApplyToListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listingId, payload }: { listingId: string; payload?: Record<string, unknown> }) =>
      applyToListing(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.myApplications() })
      toast.success("Application submitted successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit application")
    },
  })
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { stage?: string; score?: number } & Record<string, unknown> }) =>
      updateApplication(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: applicationKeys.companyApplications() })
      toast.success("Application updated successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update application")
    },
  })
}

// Schedule interview mutation
export function useScheduleInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InterviewData }) =>
      scheduleInterview(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: applicationKeys.companyApplications() })
      toast.success("Interview scheduled successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to schedule interview")
    },
  })
}
