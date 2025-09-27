import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCompanyProfile,
  updateCompanyProfile,
  addTeamMember,
  removeTeamMember,
  getPublicCompanyProfile,
  getInternProfile,
  updateInternProfile,
  addExperience,
  removeExperience,
  type CompanyProfileData,
  type InternProfileData,
  type TeamMember,
} from "@/services/profileService"
import type { Experience } from "@/types/api"
import { toast } from "sonner"

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  company: () => [...profileKeys.all, 'company'] as const,
  companyMe: () => [...profileKeys.company(), 'me'] as const,
  companyPublic: (id: string) => [...profileKeys.company(), 'public', id] as const,
  intern: () => [...profileKeys.all, 'intern'] as const,
  internMe: () => [...profileKeys.intern(), 'me'] as const,
}

// Company Profile Hooks
export function useCompanyProfile() {
  return useQuery({
    queryKey: profileKeys.companyMe(),
    queryFn: getCompanyProfile,
  })
}

export function usePublicCompanyProfile(companyId: string) {
  return useQuery({
    queryKey: profileKeys.companyPublic(companyId),
    queryFn: () => getPublicCompanyProfile(companyId),
    enabled: !!companyId,
  })
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<CompanyProfileData>) => updateCompanyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.companyMe() })
      toast.success("Company profile updated successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update company profile")
    },
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<TeamMember, 'id'>) => addTeamMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.companyMe() })
      toast.success("Team member added successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add team member")
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => removeTeamMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.companyMe() })
      toast.success("Team member removed successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove team member")
    },
  })
}

// Intern Profile Hooks
export function useInternProfile() {
  return useQuery({
    queryKey: profileKeys.internMe(),
    queryFn: getInternProfile,
  })
}

export function useUpdateInternProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<InternProfileData>) => updateInternProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.internMe() })
      toast.success("Profile updated successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile")
    },
  })
}

export function useAddExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<Experience, 'id' | '_id'>) => addExperience(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.internMe() })
      toast.success("Experience added successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add experience")
    },
  })
}

export function useRemoveExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (experienceId: string) => removeExperience(experienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.internMe() })
      toast.success("Experience removed successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove experience")
    },
  })
}
