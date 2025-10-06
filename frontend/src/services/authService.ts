import axios from 'axios';
import { AuthUser } from '@/types/auth';

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:5000';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach bearer token if present (optional; cookies are primary)
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helpers
const fetchMe = async (): Promise<AuthUser> => {
  const res = await api.get('/api/auth/me');
  return res.data?.data as AuthUser;
};

export const login = async (
  credentials: { email: string; password: string; role: 'intern' | 'company' }
): Promise<AuthUser> => {
  await api.post(`/api/auth/login/${credentials.role}`, {
    email: credentials.email,
    password: credentials.password,
  });
  // Server sets httpOnly cookie; fetch current user
  return await fetchMe();
};

export const register = async (
  data: any,
  role: 'intern' | 'company'
): Promise<AuthUser> => {
  await api.post(`/api/auth/register/${role}`, data);
  return await fetchMe();
};

export const logout = async (): Promise<void> => {
  try {
    await api.get('/api/auth/logout');
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const res = await api.get('/api/auth/me', { validateStatus: (s) => s < 500 });
  if (res.status === 401) return null;
  if (res.status >= 200 && res.status < 300) return (res.data?.data as AuthUser) || null;
  throw new Error(res.data?.message || 'Failed to fetch user');
};

