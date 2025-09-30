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
import { jobService } from "@/services/jobService"

interface JobFormData {
  title: string
  description: string
  location: string
  type: string
  level: string
  salaryMin: string
  salaryMax: string
  currency: string
  period: string
  requirements: string
  responsibilities: string
  qualifications: string
  applicationDeadline: string
  isRemote: boolean
  status: 'active' | 'draft' | 'closed'
}

const employmentTypes = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" }
]

const jobLevels = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive" }
]

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD (C$)" }
]

const salaryPeriods = [
  { value: "hourly", label: "Per Hour" },
  { value: "monthly", label: "Per Month" },
  { value: "yearly", label: "Per Year" }
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
    type: "internship",
    level: "entry",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    period: "yearly",
    requirements: "",
    responsibilities: "",
    qualifications: "",
    applicationDeadline: "",
    isRemote: false,
    status: "draft"
  })

  // Fetch job data
  const { data: jobResponse, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJobById(jobId),
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
        type: job.type || "internship",
        level: job.level || "entry",
        salaryMin: job.salary?.min?.toString() || "",
        salaryMax: job.salary?.max?.toString() || "",
        currency: job.salary?.currency || "USD",
        period: job.salary?.period || "yearly",
        requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements || "",
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join(", ") : job.responsibilities || "",
        qualifications: Array.isArray(job.qualifications) ? job.qualifications.join(", ") : job.qualifications || "",
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
        isRemote: job.isRemote || false,
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
        level: formData.level,
        salary: formData.salaryMin && formData.salaryMax ? {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
          currency: formData.currency,
          period: formData.period
        } : undefined,
        requirements: formData.requirements.split(",").map(s => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split(",").map(s => s.trim()).filter(Boolean),
        qualifications: formData.qualifications.split(",").map(s => s.trim()).filter(Boolean),
        applicationDeadline: formData.applicationDeadline || undefined,
        isRemote: formData.isRemote,
        status: formData.status
      }

      await updateJobMutation.mutateAsync({ jobId, jobData: updateData })
      
      toast({
        title: "Job updated successfully",
        description: "Your job listing has been updated.",
      })
      
      router.push("/dashboard/client/jobListings")
    } catch (error) {
      toast({
        title: "Failed to update job",
        description: "Please try again later.",
        variant: "destructive",
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Experience Level</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isRemote"
                  checked={formData.isRemote}
                  onCheckedChange={(checked) => handleInputChange("isRemote", checked)}
                />
                <Label htmlFor="isRemote">This is a remote position</Label>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                    placeholder="e.g. 70000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select value={formData.period} onValueChange={(value) => handleInputChange("period", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="List key requirements separated by commas (e.g. React experience, 2+ years, Bachelor's degree)"
                  rows={3}
                />
                <p className="text-sm text-gray-500">Separate multiple requirements with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  placeholder="List key responsibilities separated by commas (e.g. Develop user interfaces, Collaborate with design team, Write clean code)"
                  rows={3}
                />
                <p className="text-sm text-gray-500">Separate multiple responsibilities with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => handleInputChange("qualifications", e.target.value)}
                  placeholder="List preferred qualifications separated by commas (e.g. TypeScript experience, UI/UX knowledge, Portfolio)"
                  rows={3}
                />
                <p className="text-sm text-gray-500">Separate multiple qualifications with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                />
                <p className="text-sm text-gray-500">Leave empty for no deadline</p>
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
