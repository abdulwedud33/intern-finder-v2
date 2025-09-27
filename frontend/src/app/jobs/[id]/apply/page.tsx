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
import { getListingById } from "@/services/listingsService"
import { applyToListing } from "@/services/applicationsService"
import { useToast } from "@/components/ui/use-toast"
import { useAuthUser } from "@/hooks/useAuth"

function JobApplicationContent({ listingId }: { listingId: string }) {
  const { data: user } = useAuthUser()
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    coverLetter: "",
    previousJobTitle: "",
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!resumeFile) {
        throw new Error("Resume file is required")
      }

      const formDataToSend = new FormData()
      formDataToSend.append("coverLetter", formData.coverLetter)
      formDataToSend.append("previousJobTitle", formData.previousJobTitle)
      formDataToSend.append("resume", resumeFile)

      return await applyToListing(listingId, formDataToSend)
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: `Your application for ${jobData.title} at ${jobData.company} has been submitted. You'll hear back from the company soon.`,
        duration: 5000,
      })
      queryClient.invalidateQueries({ queryKey: ["my-applications"] })
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

  const { data } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => getListingById(listingId),
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

  const listing = (data as { data?: unknown } | undefined)?.data as
    | {
        title?: string
        user?: { name?: string }
        location?: string
        typesOfEmployment?: string[]
        type?: string
        salaryRange?: { min: number; max: number }
        applicantsCount?: number
        description?: string
        qualifications?: string[]
      }
    | undefined

  const jobData = {
    title: listing?.title || "",
    company: listing?.user?.name || "",
    location: listing?.location || "",
    type: Array.isArray(listing?.typesOfEmployment) ? listing?.typesOfEmployment.join(", ") : listing?.type || "",
    salary: listing?.salaryRange ? `$${listing.salaryRange.min} - $${listing.salaryRange.max}` : "",
    applicants: listing?.applicantsCount ?? 0,
    description: listing?.description || "",
    requirements: Array.isArray(listing?.qualifications) ? listing?.qualifications : [],
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
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-600">Basic details about yourself</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="previousJobTitle" className="text-sm font-medium">
                          Previous Job Title
                        </Label>
                        <Input
                          id="previousJobTitle"
                          value={formData.previousJobTitle}
                          onChange={(e) => handleInputChange("previousJobTitle", e.target.value)}
                          placeholder="Enter your most recent job title or 'Student' if no previous experience"
                          className="h-11"
                        />
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

                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Resume & Documents</h3>
                        <p className="text-sm text-gray-600">Upload your latest resume and any supporting documents</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Attach your resume *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 cursor-pointer group">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setResumeFile(file)
                              }
                            }}
                            className="hidden"
                            id="resume-upload"
                          />
                          <label htmlFor="resume-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 text-gray-400 group-hover:text-teal-500 mx-auto mb-4 transition-colors" />
                            <p className="text-base text-gray-600 mb-2">
                              <span className="text-teal-600 font-medium">Click to upload</span> or drag and drop your
                              resume
                            </p>
                            <p className="text-sm text-gray-500">PDF, DOC, DOCX (max. 10MB)</p>
                            {resumeFile && <p className="text-sm text-green-600 mt-2">Selected: {resumeFile.name}</p>}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t">
                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-base font-medium rounded-lg transition-colors"
                        disabled={isSubmitting || !resumeFile}
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
