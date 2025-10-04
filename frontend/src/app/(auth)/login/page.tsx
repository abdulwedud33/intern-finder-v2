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
import { Loader2 } from "lucide-react"

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
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      
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
      }

      if (data.rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberMe", "true")
      }

      // Get user type from response
      const userType = responseData.userType || responseData.user?.role

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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={watchedRememberMe}
                      {...register("rememberMe")}
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" size="lg" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-teal-600 hover:underline font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right - Quote */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-teal-600 to-blue-700 text-white p-10">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-semibold leading-tight">"Creativity is intelligence having fun."</h2>
          <p className="text-sm text-white/80">— Albert Einstein</p>
        </div>
      </div>
    </div>
  )
}
