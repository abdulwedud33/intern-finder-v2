import { api } from './api';

// Types for dashboard data
export interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  };
  interviews: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  recentApplications?: any[];
  upcomingInterviews?: any[];
}

export interface ApplicationStats {
  status: string;
  count: number;
  avgResponseDays?: number;
}

export interface InterviewStats {
  status: string;
  count: number;
  avgScheduledDays?: number;
}

export interface JobStats {
  total: number;
  stats: Record<string, number>;
  totalApplications: number;
}

export interface CompanyApplicationStats {
  total: number;
  stats: Record<string, number>;
}

export interface WeeklyPerformanceData {
  week: string;
  applications: number;
  interviews: number;
  hires: number;
}

export interface JobTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface ApplicationStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'job' | 'review';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  metadata?: any;
}

// Dashboard Service
export const dashboardService = {
  // Get general dashboard statistics
  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  // Get application statistics
  async getApplicationStats(): Promise<{ success: boolean; data: ApplicationStats[] }> {
    const response = await api.get('/stats/applications');
    return response.data;
  },

  // Get interview statistics
  async getInterviewStats(): Promise<{ success: boolean; data: InterviewStats[] }> {
    const response = await api.get('/stats/interviews');
    return response.data;
  },

  // Get company application statistics
  async getCompanyApplicationStats(): Promise<{ success: boolean; data: CompanyApplicationStats }> {
    const response = await api.get('/applications/stats/company');
    return response.data;
  },

  // Get intern application statistics
  async getMyApplicationStats(): Promise<{ success: boolean; data: CompanyApplicationStats }> {
    const response = await api.get('/applications/stats/me');
    return response.data;
  },

  // Get company job statistics
  async getCompanyJobStats(): Promise<{ success: boolean; data: JobStats }> {
    const response = await api.get('/jobs/stats/company');
    return response.data;
  },

  // Get recent applications for company
  async getRecentApplications(limit: number = 5): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get(`/applications?limit=${limit}&sort=-createdAt`);
    return response.data;
  },

  // Get recent applications for intern
  async getMyRecentApplications(limit: number = 5): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get(`/applications/me?limit=${limit}&sort=-createdAt`);
    return response.data;
  },

  // Get upcoming interviews
  async getUpcomingInterviews(limit: number = 5): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get(`/interviews/me?status=scheduled&limit=${limit}&sort=date`);
    return response.data;
  },

  // Get company interviews
  async getCompanyInterviews(limit: number = 5): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get(`/interviews/company?limit=${limit}&sort=-createdAt`);
    return response.data;
  },

  // Get jobs for charts (with filters)
  async getJobsForCharts(filters?: {
    status?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<{ success: boolean; data: any[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateRange) {
      params.append('createdAt[gte]', filters.dateRange.start);
      params.append('createdAt[lte]', filters.dateRange.end);
    }
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get applications for charts
  async getApplicationsForCharts(filters?: {
    status?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<{ success: boolean; data: any[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateRange) {
      params.append('createdAt[gte]', filters.dateRange.start);
      params.append('createdAt[lte]', filters.dateRange.end);
    }
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/applications?${params.toString()}`);
    return response.data;
  },

  // Get interviews for charts
  async getInterviewsForCharts(filters?: {
    status?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<{ success: boolean; data: any[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateRange) {
      params.append('date[gte]', filters.dateRange.start);
      params.append('date[lte]', filters.dateRange.end);
    }
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/interviews?${params.toString()}`);
    return response.data;
  }
};

// Utility functions for data transformation
export const dashboardUtils = {
  // Transform application stats to chart data
  transformApplicationStatsToChart(stats: ApplicationStats[]): ApplicationStatusData[] {
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    return stats.map(stat => ({
      status: stat.status,
      count: stat.count,
      percentage: total > 0 ? Math.round((stat.count / total) * 100) : 0
    }));
  },

  // Transform interview stats to chart data
  transformInterviewStatsToChart(stats: InterviewStats[]): ApplicationStatusData[] {
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    return stats.map(stat => ({
      status: stat.status,
      count: stat.count,
      percentage: total > 0 ? Math.round((stat.count / total) * 100) : 0
    }));
  },

  // Generate weekly performance data from applications
  generateWeeklyPerformanceData(applications: any[], interviews: any[]): WeeklyPerformanceData[] {
    const weeks: Record<string, { applications: number; interviews: number; hires: number }> = {};
    
    // Process applications
    applications.forEach(app => {
      const week = new Date(app.createdAt).toISOString().split('T')[0];
      const weekStart = new Date(week);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { applications: 0, interviews: 0, hires: 0 };
      }
      weeks[weekKey].applications++;
      
      if (app.status === 'hired' || app.status === 'accepted') {
        weeks[weekKey].hires++;
      }
    });

    // Process interviews
    interviews.forEach(interview => {
      const week = new Date(interview.date).toISOString().split('T')[0];
      const weekStart = new Date(week);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { applications: 0, interviews: 0, hires: 0 };
      }
      weeks[weekKey].interviews++;
    });

    // Convert to array and sort by date
    return Object.entries(weeks)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  },

  // Generate job type distribution from jobs
  generateJobTypeDistribution(jobs: any[]): JobTypeDistribution[] {
    const typeCount: Record<string, number> = {};
    
    jobs.forEach(job => {
      const type = job.type || 'Full-time';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const total = jobs.length;
    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  },

  // Generate recent activity from various data sources
  generateRecentActivity(
    applications: any[],
    interviews: any[],
    jobs: any[]
  ): RecentActivity[] {
    const activities: RecentActivity[] = [];

    // Add recent applications
    applications.slice(0, 3).forEach(app => {
      activities.push({
        id: `app-${app._id}`,
        type: 'application',
        title: `New application for ${app.job?.title || 'Job'}`,
        description: `Applied by ${app.user?.name || 'User'}`,
        timestamp: app.createdAt,
        status: app.status,
        metadata: { applicationId: app._id }
      });
    });

    // Add recent interviews
    interviews.slice(0, 3).forEach(interview => {
      activities.push({
        id: `interview-${interview._id}`,
        type: 'interview',
        title: `Interview scheduled`,
        description: `Interview for ${interview.application?.job?.title || 'Position'}`,
        timestamp: interview.createdAt,
        status: interview.status,
        metadata: { interviewId: interview._id }
      });
    });

    // Add recent jobs
    jobs.slice(0, 2).forEach(job => {
      activities.push({
        id: `job-${job._id}`,
        type: 'job',
        title: `New job posted: ${job.title}`,
        description: `${job.company?.name || 'Company'} - ${job.location}`,
        timestamp: job.createdAt,
        status: job.status,
        metadata: { jobId: job._id }
      });
    });

    // Sort by timestamp and return latest 8
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }
};

export default dashboardService;
