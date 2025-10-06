import { api } from './api';

export interface CreateApplicationRequest {
  jobId: string;
  coverLetter: string;
  resume?: File;
}

export interface ApplicationResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: {
      _id: string;
      name: string;
      logo?: string;
    };
  };
  internId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'under_review' | 'interview' | 'accepted' | 'rejected';
  coverLetter?: string;
  resume?: string;
  createdAt: string;
  updatedAt: string;
}

export const applicationService = {
  // Create an application
  async createApplication(applicationData: CreateApplicationRequest): Promise<ApplicationResponse> {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('jobId', applicationData.jobId);
    formData.append('coverLetter', applicationData.coverLetter);
    
    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }

    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get my applications (for interns)
  async getMyApplications(): Promise<ApplicationResponse> {
    const response = await api.get('/applications/me');
    return response.data;
  },

  // Get company applications (for companies)
  async getCompanyApplications(filters: Record<string, unknown> = {}): Promise<ApplicationResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const response = await api.get(`/applications/company?${params.toString()}`);
    return response.data;
  },

  // Get application by ID
  async getApplication(applicationId: string): Promise<ApplicationResponse> {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Update application status (for companies)
  async updateApplicationStatus(applicationId: string, status: string): Promise<ApplicationResponse> {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data;
  },

  // Update application (alias for updateApplicationStatus)
  async updateApplication(applicationId: string, updateData: { status?: string }): Promise<ApplicationResponse> {
    const response = await api.put(`/applications/${applicationId}/status`, updateData);
    return response.data;
  },

  // Delete application
  async deleteApplication(applicationId: string): Promise<ApplicationResponse> {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },

  // Pre-check job before applying
  async preCheckJob(jobId: string): Promise<ApplicationResponse> {
    const response = await api.get(`/applications/precheck/${jobId}`);
    return response.data;
  },

  // Get application statistics
  async getApplicationStats(): Promise<ApplicationResponse> {
    const response = await api.get('/applications/stats/me');
    return response.data;
  },

  // Get company application statistics
  async getCompanyApplicationStats(): Promise<ApplicationResponse> {
    const response = await api.get('/applications/stats/company');
    return response.data;
  }
};

export default applicationService;
