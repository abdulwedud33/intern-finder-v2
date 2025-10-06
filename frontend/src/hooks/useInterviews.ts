import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, CreateInterviewRequest, UpdateInterviewRequest } from '@/services/interviewService';

// Hook for getting all interviews for current user (intern or company)
export function useMyInterviews() {
  return useQuery({
    queryKey: ['myInterviews'],
    queryFn: () => interviewService.getMyInterviews(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting interviews for a specific company
export function useCompanyInterviews(companyId: string) {
  return useQuery({
    queryKey: ['companyInterviews', companyId],
    queryFn: () => interviewService.getCompanyInterviews(companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!companyId, // Only run query if companyId is available
  });
}

// Hook for getting interviews for a specific application
export function useApplicationInterviews(applicationId: string) {
  return useQuery({
    queryKey: ['applicationInterviews', applicationId],
    queryFn: () => interviewService.getApplicationInterviews(applicationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting a single interview by ID
export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => interviewService.getInterview(interviewId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!interviewId,
  });
}

// Hook for creating an interview
export function useCreateInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInterviewRequest) => interviewService.createInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['companyInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['applicationInterviews'] });
    },
  });
}

// Hook for updating an interview
export function useUpdateInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, data }: { interviewId: string; data: UpdateInterviewRequest }) => 
      interviewService.updateInterview(interviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['companyInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['applicationInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview'] });
    },
  });
}

// Hook for deleting an interview
export function useDeleteInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (interviewId: string) => interviewService.deleteInterview(interviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['companyInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['applicationInterviews'] });
    },
  });
}

// Hook for canceling an interview
export function useCancelInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, reason }: { interviewId: string; reason?: string }) => 
      interviewService.cancelInterview(interviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['companyInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['applicationInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview'] });
    },
  });
}

// Hook for rescheduling an interview
export function useRescheduleInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, newDate, reason }: { interviewId: string; newDate: string; reason?: string }) => 
      interviewService.rescheduleInterview(interviewId, newDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['companyInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['applicationInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview'] });
    },
  });
}

// Hook for submitting interview feedback
export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient();
  
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
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['companyInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['applicationInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview'] });
    },
  });
}

// Hook for getting interview statistics
export function useInterviewStats() {
  return useQuery({
    queryKey: ['interviewStats'],
    queryFn: () => interviewService.getInterviewStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}