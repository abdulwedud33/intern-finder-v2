import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobManagementService, CreateJobRequest, UpdateJobRequest } from '@/services/jobManagementService';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (jobData: CreateJobRequest) => jobManagementService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      toast({
        title: "Job created successfully",
        description: "Your job listing has been published.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create job",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// Hook for updating a job
export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ jobId, jobData }: { jobId: string; jobData: Partial<CreateJobRequest> }) => 
      jobManagementService.updateJob(jobId, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job updated successfully",
        description: "Your job listing has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update job",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting a job
export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (jobId: string) => jobManagementService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job deleted successfully",
        description: "The job listing has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete job",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// Hook for closing a job
export function useCloseJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (jobId: string) => jobManagementService.closeJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job closed successfully",
        description: "The job listing has been closed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to close job",
        description: "Please try again later.",
        variant: "destructive",
      });
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
