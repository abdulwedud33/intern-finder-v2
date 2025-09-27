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
import { useCreateListing } from "@/hooks/useListings"
import { toast } from "sonner"
import type { CreateListingRequest } from "@/services/listingsService"

export default function NewJobPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    jobTitle: "",
    employmentType: {
      fullTime: false,
      partTime: false,
      remote: false,
    },
    categories: [] as string[],
    salaryRangeMin: 0,
    salaryRangeMax: 0,
    jobDescription: "",
    responsibilities: "",
    professionalSkills: "",
    location: "",
    dueDate: "",
    capacity: 0,
    qualifications: "",
    niceToHaves: "",
  })
  const router = useRouter()
  const createListingMutation = useCreateListing()

  const steps = [
    { number: 1, title: "Job Information", icon: "📋" },
    { number: 2, title: "Job Description", icon: "📝" },
    { number: 3, title: "Job Review", icon: "👁️" },
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  type EmploymentTypeKey = 'fullTime' | 'partTime' | 'remote';

  const handleCheckboxChange = (type: EmploymentTypeKey) => {
    setFormData((prevData) => ({
      ...prevData,
      employmentType: {
        ...prevData.employmentType,
        [type]: !prevData.employmentType[type],
      },
    }))
  }

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
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
  {/* Basic Information Section */}
  <div className="space-y-1">
    <h2 className="text-xl font-semibold">Basic Information</h2>
    <p className="text-sm text-gray-500">This information will be displayed publicly</p>
  </div>
  <div className="w-full h-px bg-gray-200 my-4" />

  {/* Job Title */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
    <div className="space-y-1">
      <Label htmlFor="jobTitle" className="text-sm font-medium leading-none">Job Title</Label>
      <p className="text-xs text-gray-500">Must be describe one interns</p>
    </div>
    <div className="flex flex-col space-y-1">
      <Input
        id="jobTitle"
        placeholder="e.g. Software Engineer"
        value={formData.jobTitle}
        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
        className="w-full"
      />
      <p className="text-xs text-gray-500 text-right">At least 80 characters</p>
    </div>
  </div>
  <div className="w-full h-px bg-gray-200 my-4" />

  {/* Location */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
    <div className="space-y-1">
      <Label htmlFor="location" className="text-sm font-medium leading-none">Location</Label>
      <p className="text-xs text-gray-500">City, Country (e.g., Paris, France)</p>
    </div>
    <div className="flex flex-col space-y-1">
      <Input
        id="location"
        placeholder="e.g. Paris, France"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full"
      />
    </div>
  </div>
  <div className="w-full h-px bg-gray-200 my-4" />

  {/* Type of Employment */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
    <div className="space-y-1">
      <Label className="text-sm font-medium leading-none">Type of Employment</Label>
      <p className="text-xs text-gray-500">You can select multiple type of interns</p>
    </div>
    <div className="space-y-2">
      {(['fullTime', 'partTime', 'remote'] as EmploymentTypeKey[]).map((type) => (
        <div key={type} className="flex items-center space-x-2">
          <Checkbox
            id={type}
            checked={formData.employmentType[type]}
            onCheckedChange={() => handleCheckboxChange(type)}
          />
          <Label htmlFor={type} className="text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
          </Label>
        </div>
      ))}
    </div>
  </div>
  <div className="w-full h-px bg-gray-200 my-4" />

  {/* Categories */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
    <div className="space-y-1">
      <Label htmlFor="category" className="text-sm font-medium leading-none">Categories</Label>
      <p className="text-xs text-gray-500">You can select multiple internship categories</p>
    </div>
    <Select onValueChange={(value) => setFormData({ ...formData, categories: [value] })}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Job Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="design">Design</SelectItem>
        <SelectItem value="development">Development</SelectItem>
        <SelectItem value="marketing">Marketing</SelectItem>
        <SelectItem value="sales">Sales</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="w-full h-px bg-gray-200 my-4" />

  {/* Salary */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
    <div className="space-y-1">
      <Label className="text-sm font-medium leading-none">Salary</Label>
      <p className="text-xs text-gray-500">
        Please specify the estimated salary range for the role. You can leave this blank
      </p>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 w-1/4">
        <span className="text-gray-500">$</span>
        <Input
          type="number"
          value={formData.salaryRangeMin}
          onChange={(e) => setFormData({ ...formData, salaryRangeMin: Number(e.target.value) })}
          className="text-center"
        />
      </div>
      <span className="text-gray-500">to</span>
      <div className="flex items-center gap-2 w-1/4">
        <span className="text-gray-500">$</span>
        <Input
          type="number"
          value={formData.salaryRangeMax}
          onChange={(e) => setFormData({ ...formData, salaryRangeMax: Number(e.target.value) })}
          className="text-center"
        />
      </div>
      <Button variant="outline" className="w-1/4 text-teal-600 border-teal-600 hover:bg-green-50">Free</Button>
    </div>
  </div>
  <div className="w-full h-px bg-gray-200 my-4" />
</div>
        )

      case 2:
        return (
          <div className="max-w-4xl mx-auto p-8 bg-white">
  {/* Header Section */}
  <div>
    <h2 className="text-xl font-semibold mb-2">Details</h2>
    <p className="text-gray-600 mb-6">
      Add the description of the job, responsibilities, and professional skills
    </p>
  </div>

  <div className="w-full h-px bg-gray-200 my-4" />

  <div className="space-y-6">
    {/* Job Description */}
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
      <div className="space-y-1">
        <Label htmlFor="jobDescription" className="text-sm font-medium leading-none">Job Descriptions</Label>
        <p className="text-xs text-gray-500">Job titles must be describe the position</p>
      </div>
      <Textarea
        id="jobDescription"
        placeholder="Enter job description"
        rows={6} // Increased rows for better visual balance
        value={formData.jobDescription}
        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
        className="w-full"
      />
    </div>

    <div className="w-full h-px bg-gray-200 my-4" />

    {/* Responsibilities */}
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
      <div className="space-y-1">
        <Label htmlFor="responsibilities" className="text-sm font-medium leading-none">Responsibilities</Label>
        <p className="text-xs text-gray-500">Outline the core responsibilities of the position</p>
      </div>
      <Textarea
        id="responsibilities"
        placeholder="Enter the responsibilities"
        rows={6} // Increased rows for better visual balance
        value={formData.responsibilities}
        onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
        className="w-full"
      />
    </div>

    <div className="w-full h-px bg-gray-200 my-4" />

    {/* Professional Skills */}
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-4 items-start">
      <div className="space-y-1">
        <Label htmlFor="professionalSkills" className="text-sm font-medium leading-none">Professional Skills</Label>
        <p className="text-xs text-gray-500">Add the skills you are looking for in the candidate</p>
      </div>
      <Textarea
        id="professionalSkills"
        placeholder="Enter professional skills"
        rows={6} // Increased rows for better visual balance
        value={formData.professionalSkills}
        onChange={(e) => setFormData({ ...formData, professionalSkills: e.target.value })}
        className="w-full"
      />
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
        <h3 className="text-lg font-semibold mb-2">Position</h3>
        <p className="text-gray-700">{formData.jobTitle || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Location</h3>
        <p className="text-gray-700">{formData.location || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <p className="text-gray-700">{(formData.categories || []).join(", ") || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Types of Employment</h3>
        <p className="text-gray-700">
          {[
            formData.employmentType.fullTime ? "Full-Time" : null,
            formData.employmentType.partTime ? "Part-Time" : null,
            formData.employmentType.remote ? "Remote" : null,
          ].filter(Boolean).join(", ") || "—"}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Salary Range</h3>
        <p className="text-gray-700">
          {formData.salaryRangeMin || formData.salaryRangeMax
            ? `$${Number(formData.salaryRangeMin) || 0} - $${Number(formData.salaryRangeMax) || 0}`
            : "—"}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Due Date</h3>
        <p className="text-gray-700">{formData.dueDate || "—"}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Capacity</h3>
        <p className="text-gray-700">{formData.capacity || 0}</p>
      </div>
    </div>

    {/* Description */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Job Description</h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {formData.jobDescription || "—"}
      </p>
    </div>

    {/* Key Responsibilities */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Key Responsibilities</h3>
      <div className="space-y-2">
        {(formData.responsibilities || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item, idx) => (
            <CheckListItem key={idx} text={item} />
          ))}
        {!(formData.responsibilities || "").split(",").map((s)=>s.trim()).filter(Boolean).length && (
          <p className="text-gray-500">—</p>
        )}
      </div>
    </div>

    {/* Qualifications */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
      <div className="space-y-2">
        {(formData.qualifications || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item, idx) => (
            <CheckListItem key={idx} text={item} />
          ))}
        {!(formData.qualifications || "").split(",").map((s)=>s.trim()).filter(Boolean).length && (
          <p className="text-gray-500">—</p>
        )}
      </div>
    </div>

    {/* Nice to Haves */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Nice to Haves</h3>
      <div className="space-y-2">
        {(formData.niceToHaves || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item, idx) => (
            <CheckListItem key={idx} text={item} />
          ))}
        {!(formData.niceToHaves || "").split(",").map((s)=>s.trim()).filter(Boolean).length && (
          <p className="text-gray-500">—</p>
        )}
      </div>
    </div>

    {/* Professional Skills */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Professional Skills</h3>
      <div className="space-y-2">
        {(formData.professionalSkills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item, idx) => (
            <CheckListItem key={idx} text={item} />
          ))}
        {!(formData.professionalSkills || "").split(",").map((s)=>s.trim()).filter(Boolean).length && (
          <p className="text-gray-500">—</p>
        )}
      </div>
    </div>
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
                if (!formData.location || !formData.jobTitle) {
                  toast.error("Please fill in Job Title and Location.")
                  return
                }

                const employmentTypes = [
                  formData.employmentType.fullTime ? "full-time" : undefined,
                  formData.employmentType.partTime ? "part-time" : undefined,
                  formData.employmentType.remote ? "remote" : undefined,
                ].filter(Boolean) as Array<'full-time' | 'part-time' | 'internship' | 'contract'>

                const payload: CreateListingRequest = {
                  title: formData.jobTitle,
                  description: [formData.jobDescription, formData.responsibilities].filter(Boolean).join("\n\n"),
                  location: formData.location,
                  type: employmentTypes[0] || "internship",
                  requirements: formData.professionalSkills.split(",").map(s => s.trim()).filter(Boolean),
                  salary: formData.salaryRangeMin && formData.salaryRangeMax 
                    ? `$${formData.salaryRangeMin} - $${formData.salaryRangeMax}`
                    : undefined,
                  benefits: [],
                  deadline: formData.dueDate || undefined,
                }

                createListingMutation.mutate(payload, {
                  onSuccess: () => {
                    router.push("/dashboard/client/jobListings")
                  }
                })
              }}
              disabled={createListingMutation.isPending}
            >
              {createListingMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
