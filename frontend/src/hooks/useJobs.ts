import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobService, Job, JobFilters, JobSearchResponse } from '@/services/jobService';

// Hook for getting all jobs with filters
export function useJobs(filters: JobFilters = {}) {
  const [currentFilters, setCurrentFilters] = useState<JobFilters>(filters);

  const {
    data: response,
    isLoading: loading,
    error,
    refetch
  } = useQuery<JobSearchResponse>({
    queryKey: ['jobs', currentFilters],
    queryFn: () => jobService.getJobs(currentFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const jobs = response?.data || [];
  const total = response?.count || 0;
  const pagination = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  };

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const searchJobs = useCallback((query: string) => {
    updateFilters({ search: query });
  }, [updateFilters]);

  return {
    jobs,
    loading,
    error,
    total,
    pagination,
    updateFilters,
    searchJobs,
    refetch
  };
}

// Hook for getting a single job by ID
export function useJobById(id: string) {
  const {
    data: response,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    job: response?.data,
    loading,
    error
  };
}

// Hook for searching jobs
export function useJobSearch(query: string, filters: Omit<JobFilters, 'search'> = {}) {
  const {
    data: response,
    isLoading: loading,
    error
  } = useQuery<JobSearchResponse>({
    queryKey: ['jobSearch', query, filters],
    queryFn: () => jobService.searchJobs(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    jobs: response?.data || [],
    total: response?.count || 0,
    loading,
    error
  };
}

// Hook for getting jobs by company
export function useJobsByCompany(companyId: string, filters: Omit<JobFilters, 'company'> = {}) {
  const {
    data: response,
    isLoading: loading,
    error
  } = useQuery<JobSearchResponse>({
    queryKey: ['companyJobs', companyId, filters],
    queryFn: () => jobService.getJobsByCompany(companyId, filters),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    jobs: response?.data || [],
    total: response?.count || 0,
    loading,
    error
  };
}

// Export types for convenience
export type { Job, JobFilters, JobSearchResponse };