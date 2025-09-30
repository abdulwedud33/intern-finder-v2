import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobManagementService, CreateJobRequest, UpdateJobRequest } from '@/services/jobManagementService';

// Hook for getting company jobs
export function useCompanyJobs() {
  return useQuery({
    queryKey: ['companyJobs'],
    queryFn: () => jobManagementService.getCompanyJobs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a job
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobData: CreateJobRequest) => jobManagementService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
    },
  });
}

// Hook for updating a job
export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, jobData }: { jobId: string; jobData: Partial<CreateJobRequest> }) => 
      jobManagementService.updateJob(jobId, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Hook for deleting a job
export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobId: string) => jobManagementService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Hook for closing a job
export function useCloseJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobId: string) => jobManagementService.closeJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Hook for getting job statistics
export function useJobStats() {
  return useQuery({
    queryKey: ['jobStats'],
    queryFn: () => jobManagementService.getJobStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for uploading job photo
export function useUploadJobPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, photo }: { jobId: string; photo: File }) => 
      jobManagementService.uploadJobPhoto(jobId, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
