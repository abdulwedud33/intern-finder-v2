import {
  applyToListing as apiApplyToListing,
  getMyApplications as apiGetMyApplications,
  getCompanyApplications as apiGetCompanyApplications,
  getApplicationById as apiGetApplicationById,
  updateApplication as apiUpdateApplication,
  scheduleInterview as apiScheduleInterview,
} from "@/lib/api"

export interface ApplicationData {
  id: string
  listingId: string
  internId: string
  stage: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
  score?: number
  appliedAt: string
  updatedAt: string
  listing?: {
    title: string
    company: string
    location: string
  }
  intern?: {
    name: string
    email: string
    profile?: any
  }
}

export interface InterviewData {
  date: string
  time: string
  type: 'phone' | 'video' | 'in-person'
  notes?: string
}

// Apply to a listing
export async function applyToListing(listingId: string, payload?: FormData | Record<string, unknown>) {
  const result = await apiApplyToListing(listingId, payload)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Get logged-in intern's applications
export async function getMyApplications(params?: Record<string, unknown>) {
  const result = await apiGetMyApplications(params)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Get company's received applications
export async function getCompanyApplications(params?: Record<string, unknown>) {
  const result = await apiGetCompanyApplications(params)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Get single application detail
export async function getApplicationById(id: string) {
  const result = await apiGetApplicationById(id)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Update application stage/score
export async function updateApplication(id: string, payload: { stage?: string; score?: number } & Record<string, unknown>) {
  const result = await apiUpdateApplication(id, payload)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Schedule interview
export async function scheduleInterview(id: string, payload: InterviewData) {
  const result = await apiScheduleInterview(id, payload as unknown as Record<string, unknown>)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}


