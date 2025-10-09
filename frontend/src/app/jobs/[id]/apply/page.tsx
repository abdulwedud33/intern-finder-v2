"use client"

import type React from "react"
import { use } from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, MapPin, Clock, DollarSign, Users, FileText, X } from "lucide-react"
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
    resume: null as File | null,
  })

  const { job, loading: jobLoading, error: jobError } = useJobById(listingId)
  const createApplicationMutation = useCreateApplication()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!job) {
        throw new Error("Job not found")
      }

      // Validate required fields
      if (!formData.coverLetter.trim()) {
        throw new Error("Cover letter is required")
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('jobId', listingId)
      formDataToSend.append('coverLetter', formData.coverLetter)
      
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume)
      }

      return await createApplicationMutation.mutateAsync({
        jobId: listingId,
        coverLetter: formData.coverLetter,
        resume: formData.resume || undefined,
      })
    },
    onSuccess: () => {
      console.log("Application submitted successfully");
      toast({
        title: "🎉 Application Submitted Successfully!",
        description: `Your application for "${job?.title}" at ${job?.company?.name} has been submitted. You'll hear back from the company soon.`,
        duration: 6000,
      })
      queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      // Delay redirect to allow user to see the success message
      setTimeout(() => {
        router.push(`/dashboard/intern/applications`)
      }, 2500)
    },
    onError: (error: unknown) => {
      console.error("Application submission error:", error);
      
      let errorTitle = "❌ Application Failed";
      let errorMessage = "Failed to submit application. Please try again.";
      
      if (error instanceof Error) {
        if (error.message === "Cover letter is required") {
          errorTitle = "⚠️ Missing Required Information";
          errorMessage = "Please write a cover letter before submitting your application.";
        } else {
          errorMessage = error.message;
        }
      } else {
        const err = error as { response?: { data?: { message?: string } } }
        if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast({ 
        title: errorTitle, 
        description: errorMessage, 
        variant: "destructive",
        duration: 7000,
      })
    },
  })

  // Handle redirection for non-intern users
  useEffect(() => {
    if (user && user.role !== "intern") {
      toast({
        title: "🚫 Access Denied",
        description: "Only interns can apply to jobs. Please log in with an intern account.",
        variant: "destructive",
        duration: 5000,
      });
      setTimeout(() => {
        router.push(`/jobs/${listingId}`)
      }, 2000);
    }
  }, [user, router, listingId, toast])

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
          {jobError && (
            <p className="text-sm text-gray-500 mb-4">Error: {jobError.toString()}</p>
          )}
          <p className="text-sm text-gray-500 mb-4">Job ID: {listingId}</p>
          <Button asChild>
            <Link href={`/jobs/${listingId}`}>Back to Job</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Helper function to normalize requirements to array format
  const normalizeRequirements = (requirements: any): string[] => {
    if (!requirements) return []
    if (Array.isArray(requirements)) return requirements
    if (typeof requirements === 'string') {
      // Split by common delimiters and clean up
      return requirements.split(/[,;|\n]/).map(req => req.trim()).filter(req => req.length > 0)
    }
    return []
  }

  const jobData = {
    title: job.title || "",
    company: job.company?.name || "",
    location: job.location || "",
    type: job.type || "",
    salary: job.salary ? (typeof job.salary === 'string' 
      ? job.salary 
      : `$${job.salary?.min?.toLocaleString()} - $${job.salary?.max?.toLocaleString()} ${job.salary?.currency || ''}/${job.salary?.period || ''}`) : "",
    applicants: 0, // This would need to be fetched separately
    description: job.description || "",
    requirements: normalizeRequirements(job.requirements),
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf' && !file.type.includes('document')) {
        toast({
          title: "⚠️ Invalid File Type",
          description: "Please upload a PDF or Word document for your resume.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "⚠️ File Too Large",
          description: "Please upload a resume file smaller than 5MB.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }
      
      setFormData((prev) => ({ ...prev, resume: file }))
      toast({
        title: "✅ Resume Uploaded",
        description: `${file.name} has been selected for upload.`,
        duration: 3000,
      })
    }
  }

  const removeResume = () => {
    setFormData((prev) => ({ ...prev, resume: null }))
    toast({
      title: "🗑️ Resume Removed",
      description: "Resume has been removed from your application.",
      duration: 2000,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Show loading toast
    toast({
      title: "🔄 Submitting Application...",
      description: "Please wait while we process your application.",
      duration: 2000,
    });
    
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
                      {jobData.requirements && jobData.requirements.length > 0 ? (
                        <ul className="text-sm text-gray-600 space-y-1">
                          {jobData.requirements.map((req: string, index: number) => (
                            <li key={index}>• {req}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No specific requirements listed</p>
                      )}
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
                          Cover Letter *
                        </Label>
                        <Textarea
                          id="coverLetter"
                          value={formData.coverLetter}
                          onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                          placeholder="Tell us about yourself, your experience, and why you're interested in this position. Include any relevant internships, projects, or skills that make you a great fit for this role."
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          {formData.coverLetter.length}/2000 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resume" className="text-sm font-medium">
                          Resume (Optional)
                        </Label>
                        <div className="space-y-3">
                          {!formData.resume ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                              <input
                                type="file"
                                id="resume"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor="resume"
                                className="cursor-pointer flex flex-col items-center space-y-2"
                              >
                                <Upload className="h-8 w-8 text-gray-400" />
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-teal-600 hover:text-teal-700">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </div>
                                <p className="text-xs text-gray-500">
                                  PDF, DOC, DOCX up to 5MB
                                </p>
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-teal-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {formData.resume.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeResume}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Upload your resume to make your application stand out. PDF format preferred.
                        </p>
                      </div>
                    </div>


                    <div className="space-y-6 pt-6 border-t">
                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting || !formData.coverLetter.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Application...
                          </>
                        ) : (
                          "Submit Application"
                        )}
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

interface ApplyPageProps {
  params: Promise<{ id: string }>
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const resolvedParams = use(params)
  return <JobApplicationContent listingId={resolvedParams.id} />
}
