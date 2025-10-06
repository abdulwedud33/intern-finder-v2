import { api } from './api';

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
  recentApplications?: Array<{
    _id: string;
    internId: {
      name: string;
      email: string;
    };
    jobId: {
      title: string;
    };
    status: string;
    createdAt: string;
  }>;
  upcomingInterviews?: Array<{
    _id: string;
    applicationId: {
      jobId: {
        title: string;
        company: string;
      };
    };
    date: string;
    status: string;
  }>;
}

export interface StatsResponse<T> {
  success: boolean;
  data: T;
}

export const statsService = {
  // Get application statistics
  async getApplicationStats(): Promise<StatsResponse<ApplicationStats[]>> {
    const response = await api.get('/stats/applications');
    return response.data;
  },

  // Get interview statistics
  async getInterviewStats(): Promise<StatsResponse<InterviewStats[]>> {
    const response = await api.get('/stats/interviews');
    return response.data;
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<StatsResponse<DashboardStats>> {
    const response = await api.get('/stats/dashboard');
    return response.data;
  }
};

export default statsService;
