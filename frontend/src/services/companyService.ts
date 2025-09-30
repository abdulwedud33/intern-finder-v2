import { api } from './api';

export interface Company {
  _id: string;
  name: string;
  email: string;
  description?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  website?: string;
  logo?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  contact?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetCompaniesResponse {
  success: boolean;
  count: number;
  pagination: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: Company[];
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  limit?: number;
  page?: number;
  sort?: string;
}

export const getCompanies = async (filters: CompanyFilters = {}): Promise<GetCompaniesResponse> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('name', filters.search);
  if (filters.industry) params.append('industry', filters.industry);
  if (filters.companySize) params.append('companySize', filters.companySize);
  if (filters.location) params.append('headquarters', filters.location);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.sort) params.append('sort', filters.sort);

  const response = await api.get(`/api/companies?${params.toString()}`);
  return response.data;
};

export const getCompanyById = async (id: string): Promise<{ success: boolean; data: Company }> => {
  const response = await api.get(`/api/companies/${id}`);
  return response.data;
};
