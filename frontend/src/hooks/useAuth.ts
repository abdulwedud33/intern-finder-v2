import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  login,
  registerIntern,
  registerCompany,
  getAuthUser,
  logout,
} from "@/lib/api"
import type { InternPayload, CompanyPayload } from "@/types/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Type aliases for compatibility
export type LoginRequest = { email: string; password: string }
export type RegisterInternRequest = InternPayload
export type RegisterCompanyRequest = CompanyPayload
export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'intern' | 'company'
  profile?: any
}

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

// Get authenticated user
export function useAuthUser() {
  return useQuery<AuthUser>({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<AuthUser> => {
      const result = await getAuthUser()
      if (!result.ok) {
        throw new Error(result.error)
      }
      // Handle different possible response structures from the backend
      const userData = (result.data as any)?.data || (result.data as any)?.user || result.data
      return userData as AuthUser
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const result = await login(credentials.email, credentials.password)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (data: any) => {
      if (data.token) {
        localStorage.setItem("token", data.token)
      }
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
      toast.success("Logged in successfully!")
      
      // Redirect based on user role
      if (data.role === "client" || data.user?.role === "company") {
        router.push("/dashboard/client")
      } else {
        router.push("/dashboard/intern")
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Login failed")
    },
  })
}

// Register intern mutation
export function useRegisterIntern() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterInternRequest) => {
      const result = await registerIntern(data)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (data: any) => {
      if (data.token) {
        localStorage.setItem("token", data.token)
      }
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
      toast.success("Account created successfully!")
      router.push("/dashboard/intern")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Registration failed")
    },
  })
}

// Register company mutation
export function useRegisterCompany() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterCompanyRequest) => {
      const result = await registerCompany(data)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (data: any) => {
      if (data.token) {
        localStorage.setItem("token", data.token)
      }
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
      toast.success("Company account created successfully!")
      router.push("/dashboard/client")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Registration failed")
    },
  })
}

// Logout function
export function useLogout() {
  const queryClient = useQueryClient()

  return () => {
    logout()
    queryClient.clear()
    toast.success("Logged out successfully!")
  }
}

// Combined auth hook that provides all auth-related functionality
export function useAuth() {
  const { data: user, isLoading, error } = useAuthUser()
  const loginMutation = useLogin()
  const registerInternMutation = useRegisterIntern()
  const registerCompanyMutation = useRegisterCompany()
  const logoutMutation = useLogout()

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    registerIntern: registerInternMutation.mutate,
    registerInternAsync: registerInternMutation.mutateAsync,
    registerCompany: registerCompanyMutation.mutate,
    registerCompanyAsync: registerCompanyMutation.mutateAsync,
    logout: logoutMutation,
  }
}
