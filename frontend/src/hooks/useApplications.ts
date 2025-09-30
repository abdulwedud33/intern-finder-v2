import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, CreateApplicationRequest } from '@/services/applicationService';

// Hook for getting my applications (interns)
export function useMyApplications() {
  return useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationService.getMyApplications(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for getting company applications (companies)
export function useCompanyApplications() {
  return useQuery({
    queryKey: ['companyApplications'],
    queryFn: () => applicationService.getCompanyApplications(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for creating an application
export function useCreateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (applicationData: CreateApplicationRequest) => 
      applicationService.createApplication(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['companyApplications'] });
    },
  });
}

// Hook for updating application status
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) => 
      applicationService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['companyApplications'] });
    },
  });
}

// Hook for deleting an application
export function useDeleteApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (applicationId: string) => applicationService.deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['companyApplications'] });
    },
  });
}

// Hook for pre-checking a job
export function usePreCheckJob() {
  return useMutation({
    mutationFn: (jobId: string) => applicationService.preCheckJob(jobId),
  });
}

// Hook for getting application statistics (interns)
export function useApplicationStats() {
  return useQuery({
    queryKey: ['applicationStats'],
    queryFn: () => applicationService.getApplicationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting company application statistics
export function useCompanyApplicationStats() {
  return useQuery({
    queryKey: ['companyApplicationStats'],
    queryFn: () => applicationService.getCompanyApplicationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
