import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, CreateInterviewRequest, UpdateInterviewRequest } from '@/services/interviewService';
import { useToast } from '@/components/ui/use-toast';

// Hook for getting my interviews
export function useMyInterviews() {
  return useQuery({
    queryKey: ['interviews', 'me'],
    queryFn: () => interviewService.getMyInterviews(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for getting company interviews
export function useCompanyInterviews(companyId: string) {
  return useQuery({
    queryKey: ['interviews', 'company', companyId],
    queryFn: () => interviewService.getCompanyInterviews(companyId),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for getting application interviews
export function useApplicationInterviews(applicationId: string) {
  return useQuery({
    queryKey: ['interviews', 'application', applicationId],
    queryFn: () => interviewService.getApplicationInterviews(applicationId),
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for getting interview by ID
export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: ['interviews', interviewId],
    queryFn: () => interviewService.getInterview(interviewId),
    enabled: !!interviewId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for creating an interview
export function useCreateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (interviewData: CreateInterviewRequest) => 
      interviewService.createInterview(interviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Interview scheduled",
        description: "The interview has been successfully scheduled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to schedule interview",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for updating an interview
export function useUpdateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ interviewId, updateData }: { interviewId: string; updateData: UpdateInterviewRequest }) => 
      interviewService.updateInterview(interviewId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: "Interview updated",
        description: "The interview has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update interview",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting an interview
export function useDeleteInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (interviewId: string) => interviewService.deleteInterview(interviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Interview deleted",
        description: "The interview has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete interview",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for cancelling an interview
export function useCancelInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ interviewId, reason }: { interviewId: string; reason?: string }) => 
      interviewService.cancelInterview(interviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Interview cancelled",
        description: "The interview has been successfully cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel interview",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for rescheduling an interview
export function useRescheduleInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ interviewId, newDate, reason }: { interviewId: string; newDate: string; reason?: string }) => 
      interviewService.rescheduleInterview(interviewId, newDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Interview rescheduled",
        description: "The interview has been successfully rescheduled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reschedule interview",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for submitting interview feedback
export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ interviewId, feedback }: { 
      interviewId: string; 
      feedback: {
        rating: number;
        comments: string;
        strengths: string[];
        improvements: string[];
        outcome: 'passed' | 'failed' | 'pending';
      }
    }) => interviewService.submitFeedback(interviewId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Feedback submitted",
        description: "Your interview feedback has been successfully submitted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit feedback",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for getting interview statistics
export function useInterviewStats() {
  return useQuery({
    queryKey: ['interviews', 'stats'],
    queryFn: () => interviewService.getInterviewStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
