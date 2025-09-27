import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { updateCompanyProfile } from "@/lib/api"
import { toast } from "sonner"

export interface ClientProfileData {
  name?: string
  description?: string
  website?: string
  industry?: string
  logo?: string
  locations?: Array<{
    id?: string
    address?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    isHeadquarters?: boolean
  }>
  size?: string
  foundedYear?: number
  linkedinUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  githubUrl?: string
  techStack?: string[]
  benefits?: string[]
  companyType?: string
  fundingStage?: string
  phoneNumber?: string
  email?: string
  contactEmail?: string
  hiringManager?: string
  hiringManagerTitle?: string
  hiringManagerEmail?: string
  hiringManagerPhone?: string
  hiringManagerLinkedIn?: string
  hiringManagerPhoto?: string
  hiringManagerBio?: string
  hiringManagerHireDate?: string
  hiringManagerStartDate?: string
  hiringManagerEndDate?: string
  hiringManagerStatus?: string
  hiringManagerRole?: string
  hiringManagerDepartment?: string
  hiringManagerLocation?: string
  hiringManagerTimeZone?: string
  hiringManagerWorkingHours?: string
  hiringManagerWorkingDays?: string
  hiringManagerWorkingHoursStart?: string
  hiringManagerWorkingHoursEnd?: string
  hiringManagerWorkingDaysStart?: string
  hiringManagerWorkingDaysEnd?: string
  hiringManagerWorkingDaysOff?: string[]
  hiringManagerWorkingHoursOff?: string[]
  hiringManagerWorkingHoursTimeZone?: string
  hiringManagerWorkingDaysTimeZone?: string
  hiringManagerWorkingHoursDaysOff?: string[]
  hiringManagerWorkingDaysDaysOff?: string[]
  hiringManagerWorkingHoursDaysOn?: string[]
  hiringManagerWorkingDaysDaysOn?: string[]
}

export function useUpdateClientProfile(
  options?: UseMutationOptions<
    { ok: true; status: number; data: unknown } | { ok: false; status: number; error: string },
    Error,
    ClientProfileData
  >
) {
  return useMutation({
    mutationFn: async (data: ClientProfileData) => {
      const response = await updateCompanyProfile(data)
      if (!response.ok) {
        throw new Error(response.error || 'Failed to update profile')
      }
      return response
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
    ...options,
  })
}
