"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Check } from 'lucide-react'; 
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCreateJob } from "@/hooks/useJobManagement"
import { useToast } from "@/components/ui/use-toast"
import type { CreateJobRequest } from "@/services/jobManagementService"

export default function NewJobPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobType: "remote", // remote, onsite, hybrid
    location: "",
    salary: "",
    duration: "",
    jobDescription: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    deadline: "",
    startDate: "",
    status: "draft" as "draft" | "published" | "closed",
  })
  const router = useRouter()
  const createJobMutation = useCreateJob()
  const { toast } = useToast()

  // Job photos will use company logo instead

  const steps = [
    { number: 1, title: "Basic Information", icon: "📋" },
    { number: 2, title: "Job Details", icon: "📝" },
    { number: 3, title: "Review & Publish", icon: "👁️" },
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      // Validate current step before proceeding
      if (currentStep === 1) {
        if (!formData.jobTitle || !formData.location || !formData.salary || !formData.duration) {
          toast({
            title: "⚠️ Complete Required Fields",
            description: "Please fill in all required fields before proceeding.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }
      } else if (currentStep === 2) {
        if (!formData.jobDescription || !formData.responsibilities || !formData.requirements) {
          toast({
            title: "⚠️ Complete Required Fields",
            description: "Please fill in job description, responsibilities, and requirements.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
      toast({
        title: "✅ Step Completed",
        description: `Moving to step ${currentStep + 1} of 3`,
        duration: 2000,
      });
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast({
        title: "← Previous Step",
        description: `Back to step ${currentStep - 1} of 3`,
        duration: 1500,
      });
    }
  }

  // Removed unused employment type handling

  const CheckListItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2 text-gray-700">
    <Check className="text-green-600 h-4 w-4 mt-1 flex-shrink-0" />
    <p>{text}</p>
  </div>
);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-sm text-gray-500">This information will be displayed publicly</p>
            </div>

            {/* Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="jobTitle" className="text-sm font-medium leading-none">Job Title *</Label>
                <p className="text-xs text-gray-500">Enter the job title (max 100 characters)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Input
                  id="jobTitle"
                  placeholder="e.g. Software Engineer Intern"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 text-right">{formData.jobTitle.length}/100</p>
              </div>
            </div>

            {/* Job Type */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label className="text-sm font-medium leading-none">Job Type *</Label>
                <p className="text-xs text-gray-500">Select the work arrangement</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="location" className="text-sm font-medium leading-none">Location *</Label>
                <p className="text-xs text-gray-500">City, Country (e.g., New York, USA)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Input
                  id="location"
                  placeholder="e.g. New York, USA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="salary" className="text-sm font-medium leading-none">Salary *</Label>
                <p className="text-xs text-gray-500">Enter salary information (e.g., $15-20/hour, $3000/month)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Input
                  id="salary"
                  placeholder="e.g. $15-20/hour"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="duration" className="text-sm font-medium leading-none">Duration *</Label>
                <p className="text-xs text-gray-500">How long is this position? (e.g., 3 months, 6 months, 1 year)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Input
                  id="duration"
                  placeholder="e.g. 3 months"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-sm font-medium leading-none">Start Date</Label>
                <p className="text-xs text-gray-500">When does this position start? (optional)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="deadline" className="text-sm font-medium leading-none">Application Deadline</Label>
                <p className="text-xs text-gray-500">When should applications be submitted by? (optional)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
            {/* Header Section */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Job Details</h2>
              <p className="text-sm text-gray-500">Describe the role, responsibilities, and requirements</p>
            </div>

            {/* Job Description */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="jobDescription" className="text-sm font-medium leading-none">Job Description *</Label>
                <p className="text-xs text-gray-500">Provide a detailed description of the role</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Textarea
                  id="jobDescription"
                  placeholder="Enter a comprehensive job description..."
                  rows={6}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 text-right">{formData.jobDescription.length} characters</p>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="responsibilities" className="text-sm font-medium leading-none">Responsibilities *</Label>
                <p className="text-xs text-gray-500">List the key responsibilities and duties</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Textarea
                  id="responsibilities"
                  placeholder="• Develop and maintain web applications&#10;• Collaborate with team members&#10;• Write clean, maintainable code"
                  rows={6}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 text-right">{formData.responsibilities.length} characters</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="requirements" className="text-sm font-medium leading-none">Requirements *</Label>
                <p className="text-xs text-gray-500">Specify the skills, experience, and qualifications needed</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Textarea
                  id="requirements"
                  placeholder="• Bachelor's degree in Computer Science or related field&#10;• Experience with React, Node.js&#10;• Strong problem-solving skills"
                  rows={6}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 text-right">{formData.requirements.length} characters</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="benefits" className="text-sm font-medium leading-none">Benefits</Label>
                <p className="text-xs text-gray-500">What benefits and perks do you offer? (optional)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <Textarea
                  id="benefits"
                  placeholder="• Flexible working hours&#10;• Mentorship program&#10;• Learning and development opportunities"
                  rows={4}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 text-right">{formData.benefits.length} characters</p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
  {/* Header Section */}
  <div>
    <h2 className="text-xl font-semibold mb-2">Review</h2>
    <p className="text-gray-600 mb-6">Review your job post before publishing</p>
  </div>
  
  {/* Job Post Details Section */}
  <div className="space-y-8">
    {/* Overview */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Job Title</h3>
        <p className="text-gray-700">{formData.jobTitle || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Job Type</h3>
        <p className="text-gray-700 capitalize">{formData.jobType || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Location</h3>
        <p className="text-gray-700">{formData.location || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Salary</h3>
        <p className="text-gray-700">{formData.salary || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Duration</h3>
        <p className="text-gray-700">{formData.duration || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Start Date</h3>
        <p className="text-gray-700">{formData.startDate || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Application Deadline</h3>
        <p className="text-gray-700">{formData.deadline || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <p className="text-gray-700 capitalize">{formData.status || "—"}</p>
      </div>
    </div>

    {/* Description */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Job Description</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {formData.jobDescription || "—"}
        </p>
      </div>
    </div>

    {/* Responsibilities */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {formData.responsibilities || "—"}
        </p>
      </div>
    </div>

    {/* Requirements */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Requirements</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {formData.requirements || "—"}
        </p>
      </div>
    </div>

    {/* Benefits */}
    {formData.benefits && (
      <div>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {formData.benefits}
          </p>
        </div>
      </div>
    )}
  </div>
</div>

        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/client/jobListings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </Link>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    currentStep >= step.number ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle className="h-6 w-6" /> : step.number}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{step.title}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${currentStep > step.number ? "bg-teal-500" : "bg-gray-300"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg p-8 mb-8">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-end gap-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Previous
            </Button>
          )}
          {currentStep < 3 ? (
            <Button onClick={() => {
              // basic guard for required fields before moving to review
              if (currentStep === 2) {
                // no-op here; moving to 3 handled below
              }
              handleNext()
            }} className="bg-teal-500 hover:bg-teal-600">
              Next Step
            </Button>
          ) : (
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => {
                // Validate required fields
                const missingFields = [];
                if (!formData.jobTitle) missingFields.push("Job Title");
                if (!formData.location) missingFields.push("Location");
                if (!formData.salary) missingFields.push("Salary");
                if (!formData.duration) missingFields.push("Duration");
                if (!formData.jobDescription) missingFields.push("Job Description");
                if (!formData.responsibilities) missingFields.push("Responsibilities");
                if (!formData.requirements) missingFields.push("Requirements");

                if (missingFields.length > 0) {
                  toast({
                    title: "⚠️ Missing Required Fields",
                    description: `Please fill in: ${missingFields.join(", ")}`,
                    variant: "destructive",
                    duration: 6000,
                  });
                  return
                }

                // Show loading toast
                toast({
                  title: "🔄 Creating Job...",
                  description: "Please wait while we create your job listing.",
                  duration: 2000,
                });

                // Create payload matching backend schema
                const payload: CreateJobRequest = {
                  title: formData.jobTitle,
                  description: formData.jobDescription,
                  location: formData.location,
                  type: formData.jobType as 'remote' | 'onsite' | 'hybrid',
                  salary: formData.salary, // String as expected by backend
                  duration: formData.duration,
                  responsibilities: formData.responsibilities, // String as expected by backend
                  requirements: formData.requirements, // String as expected by backend
                  benefits: formData.benefits || undefined,
                  deadline: formData.deadline || undefined,
                  startDate: formData.startDate || undefined,
                  status: formData.status || "draft",
                }

                createJobMutation.mutate(payload, {
                  onSuccess: (data) => {
                    console.log("Job created successfully:", data);
                    toast({
                      title: "🎉 Job Created Successfully!",
                      description: `"${formData.jobTitle}" has been posted and is now live.`,
                      duration: 5000,
                    });
                    // Redirect after a short delay to show the success message
                    setTimeout(() => {
                      router.push("/dashboard/client/jobListings");
                    }, 1500);
                  },
                  onError: (error: any) => {
                    console.error("Job creation error:", error);
                    
                    // Determine the error message based on the error type
                    let errorMessage = "Please try again later.";
                    let errorTitle = "Failed to Create Job";
                    
                    if (error?.response?.data?.message) {
                      errorMessage = error.response.data.message;
                    } else if (error?.response?.data?.error) {
                      errorMessage = error.response.data.error;
                    } else if (error?.message) {
                      errorMessage = error.message;
                    }
                    
                    // Check for specific error types
                    if (error?.response?.status === 400) {
                      errorTitle = "Validation Error";
                      errorMessage = "Please check all required fields and try again.";
                    } else if (error?.response?.status === 401) {
                      errorTitle = "Authentication Error";
                      errorMessage = "Please log in again to create a job.";
                    } else if (error?.response?.status === 403) {
                      errorTitle = "Permission Denied";
                      errorMessage = "You don't have permission to create jobs.";
                    } else if (error?.response?.status >= 500) {
                      errorTitle = "Server Error";
                      errorMessage = "Our servers are experiencing issues. Please try again later.";
                    }
                    
                    toast({
                      title: `❌ ${errorTitle}`,
                      description: errorMessage,
                      variant: "destructive",
                      duration: 7000,
                    });
                  }
                })
              }}
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Creating..." : "Create Job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
