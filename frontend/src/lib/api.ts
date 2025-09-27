import type { InternPayload, CompanyPayload } from "@/types/auth"
import type { CreateListingRequest } from "@/types/listings"
import type { ApiResult, ListingsResponse, SingleListingResponse, InternProfileResponse } from "@/types/api"

// Token management helpers
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login"
  }
}

// Enhanced fetch wrapper with automatic token attachment and 401 handling
async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeAuthToken()
    redirectToLogin()
  }

  return response
}

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SERVER_URL environment variable")
  }
  return baseUrl.replace(/\/$/, "")
}

function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.trim() === "") &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      cleaned[key] = value
    }
  })
  return cleaned as Partial<T>
}

export async function registerIntern(
  data: InternPayload
): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/auth/register/intern"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(removeEmpty(data as unknown as Record<string, unknown>)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    type ErrorResponse = { message?: string; error?: string }
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as ErrorResponse | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function registerCompany(
  data: CompanyPayload
): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/auth/register/company"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(removeEmpty(data as unknown as Record<string, unknown>)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    type ErrorResponse = { message?: string; error?: string }
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as ErrorResponse | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

// Login helpers
export type LoginResponse = { token?: string; user?: { role?: string } } & Record<string, unknown>


export async function login(
  email: string,
  password: string
): Promise<
  | { ok: true; status: number; data: LoginResponse & { role?: "intern" | "client" } }
  | { ok: false; status: number; error: string }
> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/auth/login"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body = (isJson ? await response.json() : undefined) as LoginResponse | undefined
    if (!response.ok) {
      const errorBody = body as { message?: unknown; error?: unknown } | undefined
      const message = (typeof errorBody?.message === "string" && errorBody?.message) ||
        (typeof errorBody?.error === "string" && errorBody?.error) ||
        `Login failed (${response.status})`
      return { ok: false, status: response.status, error: String(message) }
    }
    const role = body?.user?.role as "intern" | "client" | undefined
    return { ok: true, status: response.status, data: { ...(body || {}), role } }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}


// Listings helpers
export async function createListing(
  data: CreateListingRequest
): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/listings"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(removeEmpty(data as unknown as Record<string, unknown>)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    type ErrorResponse = { message?: string; error?: string }
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as ErrorResponse | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

// Auth helpers
export async function getAuthUser(): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/auth/me"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export function logout(): void {
  removeAuthToken()
  redirectToLogin()
}

export async function updateUserDetails(payload: { name?: string; email?: string }): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/auth/updatedetails"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(removeEmpty(payload as unknown as Record<string, unknown>)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function updateUserPassword(payload: { currentPassword: string; newPassword: string }): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/auth/updatepassword"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

// Additional listing helpers
export interface ListingFilters {
  search?: string
  location?: string
  type?: string
  company?: string
  limit?: number
  page?: number
  [key: string]: string | number | undefined
}

export async function getListings(params?: ListingFilters): Promise<ApiResult<ListingsResponse>> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/listings"
  const queryParams = params ? `?${new URLSearchParams(removeEmpty(params) as Record<string, string>).toString()}` : ""

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}${queryParams}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body as ListingsResponse }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getListingById(id: string): Promise<ApiResult<SingleListingResponse>> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/listings/${id}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body as SingleListingResponse }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function updateListing(id: string, data: Partial<CreateListingRequest>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/listings/${id}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(removeEmpty(data as unknown as Record<string, unknown>)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function deleteListing(id: string): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/listings/${id}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "DELETE",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getCompanyListings(): Promise<ApiResult<ListingsResponse>> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/listings/company/me"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body as ListingsResponse }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

// Profile helpers
export async function getCompanyProfile(): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/company-profile/me"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function updateCompanyProfile(profileData: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/company-profile/me"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(removeEmpty(profileData)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function addTeamMember(memberData: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/company-profile/me/team"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(removeEmpty(memberData)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function removeTeamMember(memberId: string): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/company-profile/me/team/${memberId}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "DELETE",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getPublicCompanyProfile(companyId: string): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/company-profile/${companyId}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getInternProfile(): Promise<ApiResult<InternProfileResponse>> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/profile/me"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body as InternProfileResponse }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function updateInternProfile(profileData: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/profile/me"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(removeEmpty(profileData)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function addExperience(experienceData: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/profile/me/experience"

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(removeEmpty(experienceData)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function removeExperience(experienceId: string): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/profile/me/experience/${experienceId}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "DELETE",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

// Applications helpers
export async function applyToListing(listingId: string, payload?: FormData | Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/listings/${listingId}/apply`

  try {
    const body = payload instanceof FormData 
      ? payload 
      : JSON.stringify(removeEmpty(payload || {}))

    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body,
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const responseBody: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = responseBody as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: responseBody }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getMyApplications(params?: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/applications/me"
  const queryParams = params ? `?${new URLSearchParams(removeEmpty(params) as Record<string, string>).toString()}` : ""

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}${queryParams}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getCompanyApplications(params?: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = "/api/applications/company"
  const queryParams = params ? `?${new URLSearchParams(removeEmpty(params) as Record<string, string>).toString()}` : ""

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}${queryParams}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function getApplicationById(id: string): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/applications/${id}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "GET",
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function updateApplication(id: string, payload: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/applications/${id}`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(removeEmpty(payload)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

export async function scheduleInterview(id: string, payload: Record<string, unknown>): Promise<{ ok: true; status: number; data: unknown } | { ok: false; status: number; error: string }> {
  const baseUrl = getBaseUrl()
  const endpoint = `/api/applications/${id}/interviews`

  try {
    const response = await apiRequest(`${baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(removeEmpty(payload)),
    })

    const isJson = response.headers.get("content-type")?.includes("application/json")
    const body: unknown = isJson ? await response.json() : undefined

    if (!response.ok) {
      const errorBody = body as { message?: string; error?: string } | undefined
      const message = errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`
      return { ok: false, status: response.status, error: String(message) }
    }

    return { ok: true, status: response.status, data: body }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error"
    return { ok: false, status: 0, error: message }
  }
}

