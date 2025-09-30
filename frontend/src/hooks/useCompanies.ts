import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCompanies, getCompanyById, type CompanyFilters } from '@/services/companyService';
import { useState, useEffect } from 'react';

export interface Company {
  _id: string;
  name: string;
  email: string;
  description?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  website?: string;
  logo?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  contact?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useCompanies = (initialFilters: CompanyFilters = {}) => {
  const [filters, setFilters] = useState<CompanyFilters>(initialFilters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['companies', filters],
    queryFn: () => getCompanies(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });

  const updateFilters = (newFilters: Partial<CompanyFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  return {
    companies: data?.data || [],
    loading: isLoading,
    error: error,
    total: data?.count || 0,
    page: filters.page || 1,
    limit: filters.limit || 12,
    updateFilters,
    refetch,
  };
};

// Hook for getting jobs (reusing the existing useJobs from jobService)
export { useJobs } from './useJobs';

export const useCompanyById = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
  });

  return {
    company: data?.data,
    loading: isLoading,
    error: error,
  };
};
