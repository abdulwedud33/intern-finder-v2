import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  salary: string;
  duration: string;
  responsibilities: string;
  requirements: string;
  benefits?: string;
  deadline?: string;
  startDate?: string;
  status?: 'draft' | 'published' | 'closed' | 'filled';
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string;
}

export interface JobManagementResponse {
  success: boolean;
  data: any;
  message?: string;
}

export const jobManagementService = {
  // Get company's jobs
  async getCompanyJobs(): Promise<JobManagementResponse> {
    const response = await api.get('/jobs/company');
    return response.data;
  },

  // Create a new job
  async createJob(jobData: CreateJobRequest): Promise<JobManagementResponse> {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update a job
  async updateJob(jobId: string, jobData: Partial<CreateJobRequest>): Promise<JobManagementResponse> {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Delete a job
  async deleteJob(jobId: string): Promise<JobManagementResponse> {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Close a job
  async closeJob(jobId: string): Promise<JobManagementResponse> {
    const response = await api.put(`/jobs/${jobId}/close`);
    return response.data;
  },

  // Get job statistics
  async getJobStats(): Promise<JobManagementResponse> {
    const response = await api.get('/jobs/stats/company');
    return response.data;
  },

  // Upload job photo
  async uploadJobPhoto(jobId: string, photo: File): Promise<JobManagementResponse> {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await api.put(`/jobs/${jobId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default jobManagementService;
