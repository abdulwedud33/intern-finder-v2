import { api } from './api';

export interface Job {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
    industry?: string;
    companySize?: string;
  };
  location: string;
  isRemote: boolean;
  type: string;
  level: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  applicationDeadline?: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  company?: string;
  type?: string;
  level?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface JobSearchResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: Job[];
}

export const jobService = {
  // Get all jobs with optional filters
  async getJobs(filters: JobFilters = {}): Promise<JobSearchResponse> {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get job by ID
  async getJobById(id: string): Promise<{ success: boolean; data: Job }> {
    const response = await api.get(`/jobs/detail/${id}`);
    return response.data;
  },

  // Search jobs
  async searchJobs(query: string, filters: Omit<JobFilters, 'search'> = {}): Promise<JobSearchResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getJobs(searchFilters);
  },

  // Get jobs by company
  async getJobsByCompany(companyId: string, filters: Omit<JobFilters, 'company'> = {}): Promise<JobSearchResponse> {
    const companyFilters = { ...filters, company: companyId };
    return this.getJobs(companyFilters);
  },

  // Get jobs in radius (if needed)
  async getJobsInRadius(zipcode: string, distance: number): Promise<JobSearchResponse> {
    const response = await api.get(`/jobs/radius/${zipcode}/${distance}`);
    return response.data;
  }
};

export default jobService;
