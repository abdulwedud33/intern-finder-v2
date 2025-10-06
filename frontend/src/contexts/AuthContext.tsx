'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from '@/services/authService';
import { AuthUser } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/about', '/jobs'];
      const isPublicRoute =
        publicRoutes.includes(pathname) ||
        pathname.startsWith('/jobs/') ||
        pathname.startsWith('/job/') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/');

      // First check localStorage for immediate user data
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          try {
            const userData = JSON.parse(storedUser);
            if (isMounted.current) {
              // Validate user data - for company users, they don't need a separate company field
              // since they ARE the company (stored in Company model, not User model)
              console.log('User data restored from localStorage:', userData);
              
              setUser(userData);
              setLoading(false);
              // Redirect only from auth pages when already logged in
              if (userData && ['/login', '/register'].includes(pathname)) {
                router.push(userData.role === 'company' ? '/dashboard/client' : '/dashboard/intern');
              }
              // If protected route and not authenticated, redirect to login
              if (!userData && !isPublicRoute && pathname !== '/login') {
                router.push('/login');
              }
              return; // Exit early if we have valid stored data
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            // Clear invalid data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      }

      // Fallback to API call if no stored data
      try {
        const userData = await getCurrentUser();
        if (isMounted.current) {
          setUser(userData);
          setLoading(false);
          // Redirect only from auth pages when already logged in
          if (userData && ['/login', '/register'].includes(pathname)) {
            router.push(userData.role === 'company' ? '/dashboard/client' : '/dashboard/intern');
          }
          // If protected route and not authenticated, redirect to login
          if (!userData && !isPublicRoute && pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        if (isMounted.current) {
          setUser(null);
          // Clear any invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // If we're on a protected route, redirect to login
          if (!isPublicRoute && pathname !== '/login') {
            router.push('/login');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only run auth check if we're not already loading
    if (loading) {
      checkAuth();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [pathname, router, loading]);

  // Listen for auth state changes from login page
  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        // First try to get user from localStorage (faster)
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (isMounted.current) {
            setUser(userData);
            console.log('AuthContext updated from localStorage:', userData);
          }
        } else {
          // Fallback to API call
          const userData = await getCurrentUser();
          if (isMounted.current) {
            setUser(userData);
            console.log('AuthContext updated from API:', userData);
          }
        }
      } catch (error) {
        console.error('Error in handleAuthStateChange:', error);
        if (isMounted.current) {
          setUser(null);
        }
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Default to intern; pages perform their own login today, so this is fallback
      const userData = await authLogin({ email, password, role: 'intern' });
      setUser(userData);
      router.push(userData.role === 'company' ? '/dashboard/client' : '/dashboard/intern');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const role = data?.role === 'company' ? 'company' : 'intern';
      const userData = await authRegister(data, role);
      setUser(userData);
      router.push(userData.role === 'company' ? '/dashboard/client' : '/dashboard/intern');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
