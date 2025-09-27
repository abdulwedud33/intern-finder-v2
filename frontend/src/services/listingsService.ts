import {
  getListings as apiGetListings,
  getListingById as apiGetListingById,
  createListing as apiCreateListing,
  updateListing as apiUpdateListing,
  deleteListing as apiDeleteListing,
  getCompanyListings as apiGetCompanyListings,
  type ListingFilters,
} from "@/lib/api"
import type { CreateListingRequest } from "@/types/listings"
import type { ListingsResponse, SingleListingResponse } from "@/types/api"

export interface ListingData {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'internship' | 'contract'
  salary?: string
  description: string
  requirements: string[]
  benefits?: string[]
  logo?: string
  posted: string
  deadline?: string
  companyId: string
}

// Re-export types for compatibility
export type { CreateListingRequest, ListingFilters }

// Get all listings with filters
export const getListings = async (params?: ListingFilters) => {
  const result = await apiGetListings(params)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Get single listing details
export const getListingById = async (id: string) => {
  const result = await apiGetListingById(id)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Company creates listing
export const createListing = async (payload: CreateListingRequest) => {
  const result = await apiCreateListing(payload)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Update listing
export const updateListing = async (id: string, payload: Partial<CreateListingRequest>) => {
  const result = await apiUpdateListing(id, payload)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Delete listing
export const deleteListing = async (id: string) => {
  const result = await apiDeleteListing(id)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

// Get company's listings
export const getCompanyListings = async (): Promise<ListingsResponse> => {
  const result = await apiGetCompanyListings()
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}




