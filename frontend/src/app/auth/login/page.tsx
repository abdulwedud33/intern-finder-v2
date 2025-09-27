"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
// import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { email, password } = formData
    const result = await login(email, password)
    setIsLoading(false)

    if (!result.ok) {
      toast({ title: "Login failed", description: result.error, variant: "destructive" })
      return
    }

    const token = result.data.token
    let userRole = (result.data.role || result.data.user?.role) as "intern" | "company" | undefined
    if (token && typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
    if (!userRole && token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          userRole = data?.data?.role as "intern" | "company" | undefined
        }
      } catch {}
    }
    toast({ title: "Welcome back" })
    router.push(userRole === "company" ? "/dashboard/client" : "/dashboard/intern")
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your InternFinder account</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* No role selector needed; we detect role automatically */}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, rememberMe: checked as boolean })
                      }
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" size="lg" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-gray-600">
                  Don&apos;t have an account?
                  <Link href="/auth/signup" className="text-teal-600 hover:underline font-medium">
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
          <h2 className="text-2xl font-semibold leading-tight">
            “Creativity is intelligence having fun.”
          </h2>
          <p className="text-sm text-white/80">— Albert Einstein</p>
        </div>
      </div>
    </div>
  )
}
