import {
  getCompanyProfile as apiGetCompanyProfile,
  updateCompanyProfile as apiUpdateCompanyProfile,
  addTeamMember as apiAddTeamMember,
  removeTeamMember as apiRemoveTeamMember,
  getPublicCompanyProfile as apiGetPublicCompanyProfile,
  getInternProfile as apiGetInternProfile,
  updateInternProfile as apiUpdateInternProfile,
  addExperience as apiAddExperience,
  removeExperience as apiRemoveExperience,
} from "@/lib/api"
import type { InternProfile, Experience, InternProfileResponse, FlatInternProfile } from "@/types/api"

export interface CompanyProfileData {
  id: string
  name: string
  description: string
  website?: string
  location: string
  industry: string
  size: string
  founded?: string
  logo?: string
  team: TeamMember[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  gpa?: string
}

// Use FlatInternProfile from API types instead of InternProfileData
export type { FlatInternProfile as InternProfileData }

// Company Profile APIs
export const getCompanyProfile = async () => {
  const result = await apiGetCompanyProfile()
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

export const updateCompanyProfile = async (profileData: Partial<CompanyProfileData>) => {
  const result = await apiUpdateCompanyProfile(profileData as Record<string, unknown>)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

export const addTeamMember = async (memberData: Omit<TeamMember, 'id'>) => {
  const result = await apiAddTeamMember(memberData as Record<string, unknown>)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

export const removeTeamMember = async (memberId: string) => {
  const result = await apiRemoveTeamMember(memberId)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

export const getPublicCompanyProfile = async (companyId: string) => {
  const result = await apiGetPublicCompanyProfile(companyId)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Intern Profile APIs
export const getInternProfile = async (): Promise<FlatInternProfile> => {
  const result = await apiGetInternProfile()
  console.log('Raw API result:', result)
  if (!result.ok) {
    throw new Error(result.error)
  }
  console.log('API result.data:', result.data)
  // Handle different response structures from backend
  const rawData: InternProfile = result.data?.data || result.data
  console.log('Raw profile data:', rawData)
  
  // Flatten the nested structure for easier use in components
  const flattenedData: FlatInternProfile = {
    _id: rawData._id,
    name: rawData.name,
    email: rawData.email,
    role: rawData.role,
    profilePictureUrl: rawData.profile?.profilePictureUrl,
    location: rawData.profile?.location,
    aboutMe: rawData.profile?.aboutMe,
    bio: rawData.profile?.bio,
    description: rawData.profile?.description,
    currentJob: rawData.profile?.currentJob,
    position: rawData.profile?.position,
    education: rawData.profile?.education,
    languages: rawData.profile?.languages || [],
    skills: rawData.profile?.skills || [],
    experiences: rawData.profile?.experiences || [],
    educations: rawData.profile?.educations || [],
    portfolios: rawData.profile?.portfolios || [],
    notificationSettings: rawData.profile?.notificationSettings,
    instagram: rawData.profile?.instagram,
    twitter: rawData.profile?.twitter,
    linkedin: rawData.profile?.linkedin,
    createdAt: rawData.createdAt,
    updatedAt: rawData.updatedAt,
    PhoneNumber: rawData.profile?.PhoneNumber || "",
    LinkedinUrl: rawData.profile?.LinkedinUrl || "",
    portfolioWebsiteUrl: rawData.profile?.portfolioWebsiteUrl || "",
    preferredRoles: rawData.profile?.preferredRoles || [],
  }
  
  console.log('Flattened profile data:', flattenedData)
  return flattenedData
}

export const updateInternProfile = async (profileData: Partial<InternProfile>) => {
  const result = await apiUpdateInternProfile(profileData as Record<string, unknown>)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

export const addExperience = async (experienceData: Omit<Experience, '_id' | 'id'>) => {
  const result = await apiAddExperience(experienceData as Record<string, unknown>)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

export const removeExperience = async (experienceId: string) => {
  const result = await apiRemoveExperience(experienceId)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}


