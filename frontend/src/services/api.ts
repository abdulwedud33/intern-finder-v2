import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://intern-finder-backend-v2.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL);
  return config;
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const jobService = {
  // Get all jobs with optional filters
  getJobs: async (params = {}) => {
    try {
      const response = await api.get('/jobs', { params });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      } else if (error instanceof Error) {
        throw error.message;
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  },

  // Get job by ID
  getJobById: async (id: string) => {
    try {
      const response = await api.get(`/jobs/detail/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      } else if (error instanceof Error) {
        throw error.message;
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  },

  // Search jobs
  searchJobs: async (query: string, filters: Record<string, any> = {}) => {
    try {
      const response = await api.get('/jobs/search', {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      } else if (error instanceof Error) {
        throw error.message;
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  },

  // Get jobs by company
  getJobsByCompany: async (companyId: string) => {
    try {
      const response = await api.get(`/jobs/company/${companyId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      } else if (error instanceof Error) {
        throw error.message;
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  },

  // Get jobs in radius
  getJobsInRadius: async (zipcode: string, distance: number) => {
    try {
      const response = await api.get(`/jobs/radius/${zipcode}/${distance}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      } else if (error instanceof Error) {
        throw error.message;
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  },
};
