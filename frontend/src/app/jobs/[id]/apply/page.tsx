"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, MapPin, Clock, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useJobById } from "@/hooks/useJobs"
import { useCreateApplication } from "@/hooks/useApplications"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"

function JobApplicationContent({ listingId }: { listingId: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: "",
  })

  const { job, loading: jobLoading, error: jobError } = useJobById(listingId)
  const createApplicationMutation = useCreateApplication()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!job) {
        throw new Error("Job not found")
      }

      return await createApplicationMutation.mutateAsync({
        jobId: listingId,
        coverLetter: formData.coverLetter,
      })
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: `Your application for ${job?.title} at ${job?.company?.name} has been submitted. You'll hear back from the company soon.`,
        duration: 5000,
      })
      queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      // Delay redirect to allow user to see the success message
      setTimeout(() => {
        router.push(`/jobs/${listingId}`)
      }, 2000)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: unknown } } }
      const message =
        typeof err?.response?.data?.message === "string" ? err.response.data.message : "Failed to submit application"
      toast({ title: "Could not apply", description: String(message), variant: "destructive" })
    },
  })

  // Handle redirection for non-intern users
  useEffect(() => {
    if (user && user.role !== "intern") {
      router.push(`/jobs/${listingId}`)
    }
  }, [user, router, listingId])

  // Don't render anything if user is not an intern
  if (user?.role !== "intern") {
    return null
  }

  // Show loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load job details</p>
          <Button asChild>
            <Link href={`/jobs/${listingId}`}>Back to Job</Link>
          </Button>
        </div>
      </div>
    )
  }

  const jobData = {
    title: job.title || "",
    company: job.company?.name || "",
    location: job.location || "",
    type: job.type || "",
    salary: job.salary ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()} ${job.salary.currency}/${job.salary.period}` : "",
    applicants: 0, // This would need to be fetched separately
    description: job.description || "",
    requirements: job.requirements || [],
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await mutation.mutateAsync()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex items-center gap-6 mb-4">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href={`/jobs/${listingId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Details
              </Link>
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">N</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{jobData.title}</h1>
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  Applying
                </Badge>
              </div>
              <p className="text-lg text-gray-700 font-medium mb-3">{jobData.company}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {jobData.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {jobData.type}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {jobData.salary}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {jobData.applicants} applicants
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Job Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">About This Role</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{jobData.description}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Key Requirements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {jobData.requirements.map((req: string, index: number) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Required Information</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Complete personal details</li>
                        <li>• Professional cover letter</li>
                        <li>• Updated resume (PDF preferred)</li>
                        <li>• Portfolio or LinkedIn profile</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tips for Success</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Tailor your cover letter to the role</li>
                        <li>• Highlight relevant experience</li>
                        <li>• Include specific examples</li>
                        <li>• Proofread before submitting</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Submit your application</CardTitle>
                  <p className="text-gray-600">
                    Complete the form below to apply for the{" "}
                    <span className="font-medium text-gray-900">{jobData.title}</span> position at{" "}
                    <span className="font-medium text-gray-900">{jobData.company}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Application Information</h3>
                        <p className="text-sm text-gray-600">Tell us why you're interested in this position</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                        <p className="text-sm text-gray-600">Tell us about your background and motivation</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coverLetter" className="text-sm font-medium">
                          Cover Letter
                        </Label>
                        <Textarea
                          id="coverLetter"
                          value={formData.coverLetter}
                          onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                          placeholder="Tell us about yourself, your experience, and why you're interested in this position. Include any relevant internships, projects, or skills that make you a great fit for this role."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                    </div>


                    <div className="space-y-6 pt-6 border-t">
                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-base font-medium rounded-lg transition-colors"
                        disabled={isSubmitting || !formData.coverLetter.trim()}
                      >
                        {isSubmitting ? "Submitting Application..." : "Submit Application"}
                      </Button>

                      <p className="text-sm text-gray-500 text-center leading-relaxed">
                        By submitting this application, you confirm that you accept our{" "}
                        <Link href="/terms" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobApplicationContent
