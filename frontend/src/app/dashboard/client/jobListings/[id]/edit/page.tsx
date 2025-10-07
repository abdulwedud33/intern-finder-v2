"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useUpdateJob } from "@/hooks/useJobManagement"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { jobManagementService } from "@/services/jobManagementService"

interface JobFormData {
  title: string
  description: string
  location: string
  type: 'remote' | 'onsite' | 'hybrid'
  salary: string
  duration: string
  requirements: string
  responsibilities: string
  benefits: string
  deadline: string
  startDate: string
  status: 'draft' | 'published' | 'closed' | 'filled'
}

const jobTypes = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" }
]


export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id as string

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    type: "remote",
    salary: "",
    duration: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    deadline: "",
    startDate: "",
    status: "draft"
  })

  // Fetch job data
  const { data: jobResponse, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobManagementService.getJobById(jobId),
    enabled: !!jobId,
  })

  const jobData = jobResponse?.data

  const updateJobMutation = useUpdateJob()

  // Populate form when job data loads
  useEffect(() => {
    if (jobData) {
      const job = jobData
      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        type: job.type || "remote",
        salary: job.salary || "",
        duration: job.duration || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        benefits: job.benefits || "",
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : "",
        startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : "",
        status: job.status || "draft"
      })
    }
  }, [jobData])

  const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        duration: formData.duration,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits || undefined,
        deadline: formData.deadline || undefined,
        startDate: formData.startDate || undefined,
        status: formData.status
      }

      await updateJobMutation.mutateAsync({ jobId, jobData: updateData })
      
      toast({
        title: "🎉 Job Updated Successfully!",
        description: "Your job listing has been updated.",
        duration: 5000,
      })
      
      router.push("/dashboard/client/jobListings")
    } catch (error: any) {
      console.error("Job update error:", error);
      
      let errorMessage = "Please try again later.";
      const errorTitle = "Failed to Update Job";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: `❌ ${errorTitle}`,
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingCard />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay error={error} title="Failed to load job details" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/client/jobListings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Listings
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Job Listing</h1>
              <p className="text-gray-600">Update your job posting details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Frontend Developer Intern"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g. New York, NY"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the role, company culture, and what makes this opportunity special..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary and Duration Information */}
          <Card>
            <CardHeader>
              <CardTitle>Salary & Duration Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                    placeholder="e.g. $25-30/hour or $50,000-70,000/year"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g. 3 months, 6 months, 1 year"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements and Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="List the key requirements for this position..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities *</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  placeholder="List the key responsibilities for this position..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  placeholder="List any benefits or perks offered..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Leave empty for no deadline</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">When the position starts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/client/jobListings">
              <Button variant="outline" type="button">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={updateJobMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateJobMutation.isPending ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
