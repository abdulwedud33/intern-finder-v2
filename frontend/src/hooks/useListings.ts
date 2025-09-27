import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getCompanyListings,
  type ListingData,
  type CreateListingRequest,
  type ListingFilters,
} from "@/services/listingsService"
import { toast } from "sonner"

// Query keys
export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
  company: () => [...listingKeys.all, 'company'] as const,
}

// Get all listings with filters
export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: listingKeys.list(filters || {}),
    queryFn: () => getListings(filters),
  })
}

// Get single listing details
export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => getListingById(id),
    enabled: !!id,
  })
}

// Get company's listings
export function useCompanyListings() {
  return useQuery({
    queryKey: listingKeys.company(),
    queryFn: getCompanyListings,
  })
}

// Create listing mutation
export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateListingRequest) => createListing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: listingKeys.company() })
      toast.success("Listing created successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create listing")
    },
  })
}

// Update listing mutation
export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateListingRequest> }) =>
      updateListing(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: listingKeys.company() })
      toast.success("Listing updated successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update listing")
    },
  })
}

// Delete listing mutation
export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: listingKeys.company() })
      toast.success("Listing deleted successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete listing")
    },
  })
}
