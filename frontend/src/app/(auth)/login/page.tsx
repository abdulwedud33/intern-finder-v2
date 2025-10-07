"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, ChevronRight } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const watchedRememberMe = watch("rememberMe")

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      
      // Use single unified login endpoint
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://intern-finder-backend-v2.onrender.com"
      console.log('Login: Using baseUrl:', baseUrl)
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Create error object with response data for better error handling
        const error = new Error(errorData.message || "Login failed")
        ;(error as any).response = { data: errorData }
        ;(error as any).status = response.status
        throw error
      }

      const responseData = await response.json()

      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", responseData.token)
        localStorage.setItem("user", JSON.stringify(responseData.user))
        console.log('Login: Stored user data:', responseData.user)
        console.log('Login: Stored token:', responseData.token)
      }

      if (data.rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberMe", "true")
      }

      // Get user type from response
      const userType = responseData.userType || responseData.user?.role

      // Update AuthContext with the logged-in user
      // This will trigger a re-render of all components using useAuth
      if (responseData.user) {
        console.log('Login: Dispatching authStateChanged event')
        // Force AuthContext to re-check authentication
        window.dispatchEvent(new Event('authStateChanged'))
      }

      toast.success("Login Successful! 🎉", {
        description: `Welcome back! You have successfully logged in as ${userType}.`,
        duration: 3000,
      })

      // Small delay to show success toast before redirecting
      setTimeout(() => {
        router.push(userType === "company" ? "/dashboard/client" : "/dashboard/intern")
      }, 1000)
    } catch (error: any) {
      console.error("Login error:", error)
      console.log("Error message:", error.message)
      console.log("Error response data:", error.response?.data)
      console.log("Error status:", error.status)
      
      let errorMessage = "An unexpected error occurred while logging in. Please try again."
      let isAccountNotRegistered = false
      let isWrongPassword = false
      
      if (error.name === 'NetworkError') {
        errorMessage = "Unable to connect to the server. Please check your internet connection."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
        const message = errorMessage.toLowerCase()
        
        // Check for account not registered FIRST - this takes priority
        if (message.includes('user') && (message.includes('not found') || message.includes('not exist') || message.includes('not registered'))) {
          isAccountNotRegistered = true
        }
        // Also check for email-specific not found messages
        else if (message.includes('email') && (message.includes('not found') || message.includes('not exist') || message.includes('not registered'))) {
          isAccountNotRegistered = true
        }
        // Check for generic "no account" messages
        else if (message.includes('no account') || message.includes('account not found') || message.includes('account does not exist')) {
          isAccountNotRegistered = true
        }
        // Check for specific backend error messages
        else if (message.includes('user not found') || message.includes('email not found') || message.includes('no user found')) {
          isAccountNotRegistered = true
        }
        // Check for wrong password ONLY if account exists
        else if (message.includes('incorrect password') || 
                 message.includes('wrong password') || 
                 message.includes('invalid password') || 
                 message.includes('authentication failed') ||
                 message.includes('invalid credentials') ||
                 message.includes('password is incorrect') ||
                 message.includes('invalid password provided')) {
          isWrongPassword = true
        }
      } else if (error.message) {
        errorMessage = error.message
        const message = errorMessage.toLowerCase()
        
        // Check for account not registered FIRST - this takes priority
        if (message.includes('user') && (message.includes('not found') || message.includes('not exist') || message.includes('not registered'))) {
          isAccountNotRegistered = true
        }
        // Also check for email-specific not found messages
        else if (message.includes('email') && (message.includes('not found') || message.includes('not exist') || message.includes('not registered'))) {
          isAccountNotRegistered = true
        }
        // Check for generic "no account" messages
        else if (message.includes('no account') || message.includes('account not found') || message.includes('account does not exist')) {
          isAccountNotRegistered = true
        }
        // Check for specific backend error messages
        else if (message.includes('user not found') || message.includes('email not found') || message.includes('no user found')) {
          isAccountNotRegistered = true
        }
        // Check for wrong password ONLY if account exists
        else if (message.includes('incorrect password') || 
                 message.includes('wrong password') || 
                 message.includes('invalid password') || 
                 message.includes('authentication failed') ||
                 message.includes('invalid credentials') ||
                 message.includes('password is incorrect') ||
                 message.includes('invalid password provided')) {
          isWrongPassword = true
        }
      }
      
      // Check for common HTTP status codes
      if (error.status === 404) {
        isAccountNotRegistered = true
        errorMessage = "No account found with this email address."
      } else if (error.status === 401) {
        // Only set as wrong password if we haven't already determined it's account not found
        // and if the error message doesn't indicate account not found
        if (!isAccountNotRegistered && !errorMessage.toLowerCase().includes('not found')) {
          isWrongPassword = true
          errorMessage = "Incorrect password. Please try again."
        }
      } else if (error.status === 400) {
        // Check if it's a validation error that might indicate wrong email format
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('invalid')) {
          isAccountNotRegistered = true
          errorMessage = "Invalid email format. Please check your email address."
        }
      }
      
      if (isAccountNotRegistered) {
        toast.error("Email Not Correct", {
          description: "There is no account registered with this email address. Please check your email or register first.",
          duration: 5000,
        })
        
        // Redirect to register page after a short delay
        setTimeout(() => {
          router.push('/register')
        }, 2000)
      } else if (isWrongPassword) {
        toast.error("Password Incorrect", {
          description: "The password you entered is incorrect. Please try again.",
          duration: 5000,
        })
      } else {
        toast.error("Login Failed", {
          description: errorMessage,
          duration: 5000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Form Container */}
      <div className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold bg-teal-500 bg-clip-text text-transparent mb-2 sm:mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl">
            Login to your account
          </p>
                </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-0 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">

              {/* Email Input */}
                <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register("email")}
                    disabled={isLoading}
                  className="w-full h-9 sm:h-10 text-base sm:text-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                {errors.email && <p className="text-sm text-red-500 mt-1 sm:mt-2">{errors.email.message}</p>}
                </div>

              {/* Password Input */}
                <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                  className="w-full h-9 sm:h-10 text-base sm:text-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                {errors.password && <p className="text-sm text-red-500 mt-1 sm:mt-2">{errors.password.message}</p>}
                </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Checkbox
                      id="rememberMe"
                      checked={watchedRememberMe}
                    {...register("rememberMe")}
                    className="w-4 h-4 sm:w-5 sm:h-5 border-gray-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                  <Label htmlFor="rememberMe" className="text-sm sm:text-base text-gray-600 cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm sm:text-base text-teal-600 hover:text-teal-700 hover:underline transition-colors text-center sm:text-right"
                >
                    Forgot password?
                  </Link>
                </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-teal-500 hover:bg-teal-700 active:bg-teal-800 text-white h-12 sm:h-14 text-base sm:text-lg rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isLoading}
              >
                  {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">Logging in...</span>
                    <span className="sm:hidden">Logging in...</span>
                    </>
                  ) : (
                  <>
                    <span>Login</span>
                   <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <p className="text-sm sm:text-base text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/register" 
                    className="text-teal-600 hover:text-teal-700 hover:underline font-semibold transition-colors"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
