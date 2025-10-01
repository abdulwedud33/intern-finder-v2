import { api } from './api';

export interface Interview {
  _id: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  internId: string;
  interviewer: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  scheduledDate: string;
  duration: number; // in minutes
  type: 'phone' | 'video' | 'in-person';
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: {
    rating: number;
    comments: string;
    strengths: string[];
    improvements: string[];
  };
  outcome?: 'passed' | 'failed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewRequest {
  applicationId: string;
  scheduledDate: string;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  location?: string;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateInterviewRequest {
  scheduledDate?: string;
  duration?: number;
  type?: 'phone' | 'video' | 'in-person';
  location?: string;
  meetingLink?: string;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

export interface InterviewResponse {
  success: boolean;
  data: Interview | Interview[];
  message?: string;
}

export const interviewService = {
  // Get all interviews for current user (intern or company)
  async getMyInterviews(): Promise<InterviewResponse> {
    const response = await api.get('/interviews/me');
    return response.data;
  },

  // Get interviews for a specific company
  async getCompanyInterviews(companyId: string): Promise<InterviewResponse> {
    const response = await api.get(`/interviews/companies/${companyId}/interviews`);
    return response.data;
  },

  // Get interviews for a specific application
  async getApplicationInterviews(applicationId: string): Promise<InterviewResponse> {
    const response = await api.get(`/interviews/application/${applicationId}`);
    return response.data;
  },

  // Get interview by ID
  async getInterview(interviewId: string): Promise<InterviewResponse> {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  // Create a new interview
  async createInterview(interviewData: CreateInterviewRequest): Promise<InterviewResponse> {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },

  // Update an interview
  async updateInterview(interviewId: string, updateData: UpdateInterviewRequest): Promise<InterviewResponse> {
    const response = await api.put(`/interviews/${interviewId}`, updateData);
    return response.data;
  },

  // Delete an interview
  async deleteInterview(interviewId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/interviews/${interviewId}`);
    return response.data;
  },

  // Cancel an interview
  async cancelInterview(interviewId: string, reason?: string): Promise<InterviewResponse> {
    const response = await api.put(`/interviews/${interviewId}/cancel`, { reason });
    return response.data;
  },

  // Reschedule an interview
  async rescheduleInterview(interviewId: string, newDate: string, reason?: string): Promise<InterviewResponse> {
    const response = await api.put(`/interviews/${interviewId}/reschedule`, { 
      scheduledDate: newDate, 
      reason 
    });
    return response.data;
  },

  // Submit interview feedback
  async submitFeedback(interviewId: string, feedback: {
    rating: number;
    comments: string;
    strengths: string[];
    improvements: string[];
    outcome: 'passed' | 'failed' | 'pending';
  }): Promise<InterviewResponse> {
    const response = await api.post(`/interviews/${interviewId}/feedback`, feedback);
    return response.data;
  },

  // Get interview statistics
  async getInterviewStats(): Promise<InterviewResponse> {
    const response = await api.get('/interviews/stats');
    return response.data;
  }
};
