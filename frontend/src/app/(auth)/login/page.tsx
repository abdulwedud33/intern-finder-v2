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
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["intern", "company"]),
  rememberMe: z.boolean(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: "intern",
      rememberMe: false,
    },
  })

  const watchedUserType = watch("userType")
  const watchedRememberMe = watch("rememberMe")

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const loginEndpoint = data.userType === "intern" ? "/api/auth/login/intern" : "/api/auth/login/company"
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${baseUrl}${loginEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      // Server sets cookie; optionally fetch /me elsewhere via AuthContext

      if (data.rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberMe", "true")
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })

      router.push(data.userType === "company" ? "/dashboard/client" : "/dashboard/intern")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred while logging in",
        variant: "destructive",
      })
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
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-700">I am a</Label>
                  <div className="flex space-x-4">
                    <label className="flex-1">
                      <input type="radio" className="peer hidden" value="intern" {...register("userType")} />
                      <div className="p-3 border rounded-lg text-center cursor-pointer peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 transition-colors">
                        Intern
                      </div>
                    </label>
                    <label className="flex-1">
                      <input type="radio" className="peer hidden" value="company" {...register("userType")} />
                      <div className="p-3 border rounded-lg text-center cursor-pointer peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 transition-colors">
                        Company
                      </div>
                    </label>
                  </div>
                </div>

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
                      onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
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
                    Sign up here
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
