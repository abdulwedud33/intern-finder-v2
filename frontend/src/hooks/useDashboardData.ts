import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService, dashboardUtils } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';

// Hook for general dashboard statistics
export const useDashboardData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: () => dashboardService.getDashboardStats(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for application statistics
export const useApplicationStatsData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'applicationStats', user?.id],
    queryFn: () => dashboardService.getApplicationStats(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for interview statistics
export const useInterviewStatsData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'interviewStats', user?.id],
    queryFn: () => dashboardService.getInterviewStats(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for company-specific data
export const useCompanyDashboardData = () => {
  const { user } = useAuth();
  
  const applicationStats = useQuery({
    queryKey: ['dashboard', 'companyApplicationStats', user?.id],
    queryFn: () => dashboardService.getCompanyApplicationStats(),
    enabled: !!user && user.role === 'company',
    staleTime: 1000 * 60 * 5,
  });

  const jobStats = useQuery({
    queryKey: ['dashboard', 'companyJobStats', user?.id],
    queryFn: () => dashboardService.getCompanyJobStats(),
    enabled: !!user && user.role === 'company',
    staleTime: 1000 * 60 * 5,
  });

  const recentApplications = useQuery({
    queryKey: ['dashboard', 'recentApplications', user?.id],
    queryFn: () => dashboardService.getRecentApplications(5),
    enabled: !!user && user.role === 'company',
    staleTime: 1000 * 60 * 2, // 2 minutes for recent data
  });

  const companyInterviews = useQuery({
    queryKey: ['dashboard', 'companyInterviews', user?.id],
    queryFn: () => dashboardService.getCompanyInterviews(5),
    enabled: !!user && user.role === 'company',
    staleTime: 1000 * 60 * 2,
  });

  return {
    applicationStats,
    jobStats,
    recentApplications,
    companyInterviews,
    isLoading: applicationStats.isLoading || jobStats.isLoading || recentApplications.isLoading || companyInterviews.isLoading,
    error: applicationStats.error || jobStats.error || recentApplications.error || companyInterviews.error,
  };
};

// Hook for intern-specific data
export const useInternDashboardData = () => {
  const { user } = useAuth();
  
  const applicationStats = useQuery({
    queryKey: ['dashboard', 'myApplicationStats', user?.id],
    queryFn: () => dashboardService.getMyApplicationStats(),
    enabled: !!user && user.role === 'intern',
    staleTime: 1000 * 60 * 5,
  });

  const myRecentApplications = useQuery({
    queryKey: ['dashboard', 'myRecentApplications', user?.id],
    queryFn: () => dashboardService.getMyRecentApplications(5),
    enabled: !!user && user.role === 'intern',
    staleTime: 1000 * 60 * 2,
  });

  const upcomingInterviews = useQuery({
    queryKey: ['dashboard', 'upcomingInterviews', user?.id],
    queryFn: () => dashboardService.getUpcomingInterviews(5),
    enabled: !!user && user.role === 'intern',
    staleTime: 1000 * 60 * 2,
  });

  return {
    applicationStats,
    myRecentApplications,
    upcomingInterviews,
    isLoading: applicationStats.isLoading || myRecentApplications.isLoading || upcomingInterviews.isLoading,
    error: applicationStats.error || myRecentApplications.error || upcomingInterviews.error,
  };
};

// Hook for chart data
export const useChartData = (filters?: {
  dateRange?: { start: string; end: string };
  status?: string;
  limit?: number;
}) => {
  const { user } = useAuth();
  
  const jobs = useQuery({
    queryKey: ['dashboard', 'jobsForCharts', filters, user?.id],
    queryFn: () => dashboardService.getJobsForCharts(filters),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const applications = useQuery({
    queryKey: ['dashboard', 'applicationsForCharts', filters, user?.id],
    queryFn: () => dashboardService.getApplicationsForCharts(filters),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const interviews = useQuery({
    queryKey: ['dashboard', 'interviewsForCharts', filters, user?.id],
    queryFn: () => dashboardService.getInterviewsForCharts(filters),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Transform data for charts
  const weeklyPerformanceData = jobs.data?.data && applications.data?.data && interviews.data?.data
    ? dashboardUtils.generateWeeklyPerformanceData(
        applications.data.data,
        interviews.data.data
      )
    : [];

  const jobTypeDistribution = jobs.data?.data
    ? dashboardUtils.generateJobTypeDistribution(jobs.data.data)
    : [];

  const recentActivity = jobs.data?.data && applications.data?.data && interviews.data?.data
    ? dashboardUtils.generateRecentActivity(
        applications.data.data,
        interviews.data.data,
        jobs.data.data
      )
    : [];

  return {
    jobs,
    applications,
    interviews,
    weeklyPerformanceData,
    jobTypeDistribution,
    recentActivity,
    isLoading: jobs.isLoading || applications.isLoading || interviews.isLoading,
    error: jobs.error || applications.error || interviews.error,
  };
};

// Hook for application status chart data
export const useApplicationStatusChart = () => {
  const { data: applicationStats, isLoading, error } = useApplicationStatsData();
  
  const chartData = applicationStats?.data
    ? dashboardUtils.transformApplicationStatsToChart(applicationStats.data)
    : [];

  return {
    data: chartData,
    isLoading,
    error,
  };
};

// Hook for interview status chart data
export const useInterviewStatusChart = () => {
  const { data: interviewStats, isLoading, error } = useInterviewStatsData();
  
  const chartData = interviewStats?.data
    ? dashboardUtils.transformInterviewStatsToChart(interviewStats.data)
    : [];

  return {
    data: chartData,
    isLoading,
    error,
  };
};

// Hook to refresh all dashboard data
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const refreshAll = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  };

  const refreshStats = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    }
  };

  const refreshApplications = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'applicationStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'recentApplications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'myRecentApplications'] });
    }
  };

  const refreshInterviews = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'interviewStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'upcomingInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'companyInterviews'] });
    }
  };

  return {
    refreshAll,
    refreshStats,
    refreshApplications,
    refreshInterviews,
  };
};
