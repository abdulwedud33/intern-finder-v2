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
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL);
  console.log('Token available:', !!token, token ? 'Yes' : 'No');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set');
  } else {
    console.warn('No token found in localStorage');
  }
  
  return config;
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (!error) {
      console.error('API Error: No error object provided');
      return Promise.reject(error);
    }

    // Log the raw error object first for debugging
    console.error('Raw API Error Object:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor?.name);
    console.error('Error keys:', Object.keys(error));
    console.error('Error stack:', error.stack);
    console.error('Error toString:', error.toString());

    // Check if it's an empty object or has no meaningful properties
    if (Object.keys(error).length === 0) {
      console.error('API Error: Empty error object received - this might indicate a network issue or server problem');
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('API Error: Network error -', error.message || 'No message');
    } else if (error.message === 'Request aborted') {
      console.error('API Error: Request was aborted');
    } else {
      // Standard Axios error
      console.error('API Error:', {
        url: error.config?.url || 'unknown',
        method: error.config?.method || 'unknown',
        status: error.response?.status || 'no response',
        message: error.message || 'unknown error',
        responseData: error.response?.data || null,
        code: error.code || 'no code',
        // Additional debugging info
        isAxiosError: error.isAxiosError,
        request: error.request ? 'present' : 'missing',
        config: error.config ? 'present' : 'missing',
        response: error.response ? 'present' : 'missing'
      });
    }
    
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
