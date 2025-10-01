import { useQuery } from '@tanstack/react-query';
import { statsService, type ApplicationStats, type InterviewStats, type DashboardStats } from '@/services/statsService';

// Hook for application statistics
export const useApplicationStats = () => {
  return useQuery({
    queryKey: ['stats', 'applications'],
    queryFn: () => statsService.getApplicationStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for interview statistics
export const useInterviewStats = () => {
  return useQuery({
    queryKey: ['stats', 'interviews'],
    queryFn: () => statsService.getInterviewStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: () => statsService.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for dashboard)
    refetchOnWindowFocus: true,
  });
};

// Combined hook for all statistics
export const useAllStats = () => {
  const applicationStats = useApplicationStats();
  const interviewStats = useInterviewStats();
  const dashboardStats = useDashboardStats();

  return {
    applicationStats,
    interviewStats,
    dashboardStats,
    isLoading: applicationStats.isLoading || interviewStats.isLoading || dashboardStats.isLoading,
    error: applicationStats.error || interviewStats.error || dashboardStats.error,
  };
};
