"use client"
// @ts-nocheck

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// removed unused RadioGroup imports
import { Label } from "@/components/ui/label"
import { Users, Building, Plus, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Base User schema
const baseUserSchema = z.object({
  // Required fields from User model
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot be more than 100 characters"),
  email: z.string()
    .email("Please enter a valid email")
    .regex(
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
      "Please provide a valid email"
    ),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string()
    .min(10, "Please provide a valid phone number")
    .regex(/^[0-9+() -]+$/, "Phone number contains invalid characters"),
  role: z.enum(['intern', 'company']),
  
  // Optional fields from User model
  avatar: z.any().optional(),
  about: z.string().optional(),
  location: z.string().optional(),
  website: z.string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  
  // Terms agreement (not in model but needed for form)
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Education schema (matches backend Intern.education)
const educationSchema = z.object({
  institution: z.string()
    .min(2, "Institution name is required")
    .max(100, "Institution name is too long"),
  degree: z.string()
    .min(2, "Degree is required")
    .max(100, "Degree name is too long"),
  fieldOfStudy: z.string()
    .min(2, "Field of study is required")
    .max(100, "Field of study is too long"),
  startDate: z.string()
    .min(1, "Start date is required")
    .refine(val => !isNaN(Date.parse(val)), "Invalid date format"),
  endDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), "Invalid date format")
    .nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(1000, "Description is too long").optional(),
  gpa: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val)
    .refine(val => val >= 0 && val <= 4, "GPA must be between 0 and 4")
    .optional()
    .nullable(),
});

// Skill schema (matches backend Intern.skills)
const skillSchema = z.object({
  name: z.string()
    .min(2, "Skill name is required")
    .max(50, "Skill name is too long"),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .default('intermediate'),
  yearsOfExperience: z.number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Please enter a valid number of years")
    .optional()
    .nullable(),
});

// Experience schema (matches backend Intern.experience)
const experienceSchema = z.object({
  title: z.string()
    .min(2, "Job title is required")
    .max(100, "Job title is too long"),
  company: z.string()
    .min(2, "Company name is required")
    .max(100, "Company name is too long"),
  location: z.string()
    .max(100, "Location is too long")
    .optional(),
  startDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), "Invalid date format"),
  endDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), "Invalid date format")
    .nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string()
    .max(1000, "Description is too long")
    .optional(),
  skills: z.array(z.string())
    .optional()
    .default([]),
});

// Define job preferences type first
const jobPreferencesType = {
  jobTypes: z.array(
    z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
  ),
  locations: z.array(z.string()),
  remote: z.boolean(),
  salaryExpectations: z.object({
    min: z.number().min(0).optional().nullable(),
    max: z.number().min(0).optional().nullable(),
    currency: z.string(),
    period: z.enum(['hourly', 'monthly', 'yearly']),
  }).optional(),
  industries: z.array(z.string()),
  companySizes: z.array(z.string()),
  workAuthorizations: z.array(z.string()),
  relocation: z.boolean(),
  remoteOnly: z.boolean()
};

// Create schema with default values
const jobPreferencesSchema = z.object({
  ...jobPreferencesType,
  jobTypes: jobPreferencesType.jobTypes.default([]),
  locations: jobPreferencesType.locations.default([]),
  remote: jobPreferencesType.remote.default(false),
  industries: jobPreferencesType.industries.default([]),
  companySizes: jobPreferencesType.companySizes.default([]),
  workAuthorizations: jobPreferencesType.workAuthorizations.default([]),
  relocation: jobPreferencesType.relocation.default(false),
  remoteOnly: jobPreferencesType.remoteOnly.default(false),
  salaryExpectations: jobPreferencesType.salaryExpectations.optional()
}).default({
  jobTypes: [],
  locations: [],
  remote: false,
  industries: [],
  companySizes: [],
  workAuthorizations: [],
  relocation: false,
  remoteOnly: false
});

// Intern-specific schema (extends base user schema)
const internSchema = baseUserSchema.extend({
  role: z.literal("intern"),
  
  // Personal Information
  dateOfBirth: z.string()
    .refine(val => !isNaN(Date.parse(val)), "Invalid date format")
    .transform(val => new Date(val).toISOString()),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    error: "Please select a valid gender"
  }),
  
  // Education (required at least one)
  education: z.array(educationSchema)
    .min(1, "At least one education entry is required")
    .max(10, "Maximum 10 education entries allowed"),
  
  // Skills (required at least one)
  skills: z.array(skillSchema)
    .min(1, "At least one skill is required")
    .max(50, "Maximum 50 skills allowed"),
  
  // Experience (optional)
  experience: z.array(experienceSchema)
    .max(20, "Maximum 20 experience entries allowed")
    .optional()
    .default([]),
  
  // Documents
  resume: z.any().optional(),
  coverLetter: z.any().optional(),
  
  // Online profiles
  portfolioUrl: z.string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional()
    .transform(val => val || undefined),
  githubUrl: z.string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional()
    .transform(val => val || undefined),
  linkedinUrl: z.string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional()
    .transform(val => val || undefined),
  
  // Job preferences
  jobPreferences: jobPreferencesSchema,
  
  // Additional fields
  workAuthorization: z.string()
    .min(2, "Work authorization status is required")
    .max(100, "Work authorization status is too long"),
  // UI fields used in the form
  preferredIndustries: z.array(z.string()).optional().default([]),
  availability: z.string().optional(),
  relocation: z.boolean().optional().default(false),
  
  // System fields (not in form but needed for type safety)
  isProfileComplete: z.boolean().default(false),
  profileCompletion: z.number().min(0).max(100).default(0),
  lastActive: z.date().optional(),
  emailVerified: z.boolean().default(false),
});

// Company-specific schema (extends base user schema)
const companySchema = baseUserSchema.extend({
  role: z.literal("company"),
  
  // Company Information
  industry: z.string()
    .min(2, "Industry is required")
    .max(100, "Industry is too long"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),
  
  // Company Details
  companySize: z.enum([
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1001-5000 employees',
    '5001-10,000 employees',
    '10,001+ employees'
  ]).optional(),
  
  foundedYear: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .refine(
      val => !isNaN(val) && val >= 1800 && val <= new Date().getFullYear(),
      { message: `Year must be between 1800 and ${new Date().getFullYear()}` }
    )
    .optional()
    .nullable(),
  
  companyType: z.enum([
    'startup', 'enterprise', 'agency', 'non-profit', 'educational', 'government', 'other'
  ]).optional(),
  
  // Location
  headquarters: z.object({
    address: z.string().max(200, "Address is too long").optional(),
    city: z.string().max(100, "City name is too long").optional(),
    state: z.string().max(100, "State name is too long").optional(),
    country: z.string().max(100, "Country name is too long").optional(),
    postalCode: z.string().max(20, "Postal code is too long").optional(),
  }).optional(),
  
  // Contact Information
  contactEmail: z.string()
    .email("Please enter a valid contact email")
    .optional(),
  contactPhone: z.string()
    .max(30, "Phone number is too long")
    .optional(),
  
  // Social Media
  socialMedia: z.object({
    website: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    linkedin: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    twitter: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    facebook: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    instagram: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    youtube: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    github: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    glassdoor: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    crunchbase: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    angellist: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  }).optional().default({}),
  
  // Company Culture
  values: z.array(z.string())
    .max(10, "Maximum 10 values allowed")
    .optional()
    .default([]),
    
  mission: z.string()
    .max(1000, "Mission statement is too long")
    .optional(),
    
  vision: z.string()
    .max(1000, "Vision statement is too long")
    .optional(),
    
  culture: z.string()
    .max(5000, "Culture description is too long")
    .optional(),
  
  // Additional Information
  specialties: z.array(z.string())
    .max(20, "Maximum 20 specialties allowed")
    .optional()
    .default([]),
    
  benefits: z.array(z.string())
    .max(50, "Maximum 50 benefits allowed")
    .optional()
    .default([]),
    
  technologies: z.array(z.string())
    .max(50, "Maximum 50 technologies allowed")
    .optional()
    .default([]),
  
  // Media
  logo: z.any().optional(),
  coverImage: z.any().optional(),
  gallery: z.array(z.any())
    .max(10, "Maximum 10 gallery images allowed")
    .optional()
    .default([]),
    
  video: z.string()
    .url("Please enter a valid video URL")
    .or(z.literal(""))
    .optional()
    .transform(val => val || undefined),
  
  // Verification & Status
  isVerified: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  
  // Ratings & Reviews
  rating: z.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5")
    .default(0),
    
  reviewCount: z.number().default(0),
  
  // System Fields
  lastActive: z.date().optional(),
  emailVerified: z.boolean().default(false),
  emailVerificationToken: z.string().optional(),
  emailVerificationExpire: z.date().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpire: z.date().optional(),
});

// Define form data types
type InternFormData = z.infer<typeof internSchema>;
type CompanyFormData = z.infer<typeof companySchema>;
type RegisterFormData = InternFormData | CompanyFormData

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"intern" | "company">("intern")
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [cv, setCv] = useState<File | null>(null)
  const [logo, setLogo] = useState<File | null>(null)

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger,
    reset,
    setValue,
  } = useForm<any>({
    defaultValues: {
      role: "intern",
      agreeToTerms: false,
    } as any,
    mode: "onChange",
  })

  // Update form schema when tab changes
  useEffect(() => {
    reset({
      role: activeTab,
      agreeToTerms: false,
    } as any)
    setCurrentStep(1)
  }, [activeTab, reset])

  // Handle file upload
  const handleFileChange = (file: File | null, type: "profilePicture" | "cv" | "logo") => {
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "application/pdf"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or PDF file",
        variant: "destructive",
      })
      return
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    if (type === "profilePicture") {
      setProfilePicture(file)
    } else if (type === "cv") {
      setCv(file)
    } else if (type === "logo") {
      setLogo(file)
    }
  }

  // Removed unused appendNestedFormData helper after switching to JSON submission

  // Handle form submission
  const onSubmit: SubmitHandler<any> = async (data) => {
    console.log('Form submission started');
    
    // Trigger validation for all fields
    const isValid = await trigger();
    if (!isValid) {
      console.error('Form validation failed');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Log the form data for debugging (omit files)
      console.log('Submitting register data for role:', data.role);
      
      // Build minimal payloads the backend expects (JSON)
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = `/api/auth/register/${data.role === 'intern' ? 'intern' : 'company'}`;
      const payload = data.role === 'intern'
        ? {
            role: 'intern',
            name: (data as any).name,
            email: (data as any).email,
            password: (data as any).password,
            phone: (data as any).phone,
            dateOfBirth: (data as any).dateOfBirth,
            gender: (data as any).gender,
            education: (data as any).education?.map((e: any) => ({
              institution: e.institution,
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              startDate: e.startDate,
              endDate: e.endDate || undefined,
              isCurrent: Boolean(e.isCurrent),
            })),
            skills: (data as any).skills?.map((s: any) => (typeof s === 'string' ? { name: s } : { name: s.name })),
            location: (data as any).location,
            about: (data as any).about,
            website: (data as any).website,
            linkedinUrl: (data as any).linkedinUrl,
          }
        : {
            role: 'company',
            name: (data as any).name,
            email: (data as any).email,
            password: (data as any).password,
            phone: (data as any).phone,
            industry: (data as any).industry,
            description: (data as any).description,
            location: (data as any).location,
            website: (data as any).website,
            contactEmail: (data as any).contactEmail,
            contactPhone: (data as any).contactPhone,
          };

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.message || 'Registration failed');
      }
        
        toast({
        title: 'Registration Successful!',
        description: `Your ${data.role} account has been created successfully. Redirecting to login...`,
      });

      // Backend sets an auth cookie on register; clear it so header doesn't show logged-in
      try {
        await fetch(`${baseUrl}/api/auth/logout`, { credentials: 'include' });
      } catch (_) {}

      router.push('/login');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "An unexpected error occurred during registration. Please try again.";
      
      if (error.name === 'NetworkError') {
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    const tabValue = value as "intern" | "company"
    setActiveTab(tabValue)
  }

  // Get step content for right panel
  const getStepContent = () => {
    if (activeTab === "intern") {
      switch (currentStep) {
        case 1:
          return {
            title: '"Creativity is intelligence having fun."',
            author: "— Albert Einstein",
          }
        case 2:
          return {
            title: "Let's fill some details to make you stand out from the rest",
            author: "",
          }
        case 3:
          return {
            title: "One more step to complete your profile",
            author: "",
          }
        default:
          return { title: "", author: "" }
      }
    } else {
      switch (currentStep) {
        case 1:
          return {
            title: '"The only way to do great work is to love what you do."',
            author: "— Steve Jobs",
          }
        case 2:
          return {
            title: "Tell us more about your company",
            author: "",
          }
        case 3:
          return {
            title: "Almost there! Just a few more details",
            author: "",
          }
        default:
          return { title: "", author: "" }
      }
    }
  }

  const { title, author } = getStepContent()
  const maxSteps = 3

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Form */}
      <div className="w-full md:w-1/2 p-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
            <p className="text-gray-600">
              {activeTab === "intern"
                ? "Join as an intern and find your dream opportunity"
                : "Register your company and find talented interns"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {maxSteps}
              </span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / maxSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / maxSteps) * 100}%` }}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="intern">
                <Users className="w-4 h-4 mr-2" />
                Intern
              </TabsTrigger>
              <TabsTrigger value="company">
                <Building className="w-4 h-4 mr-2" />
                Company
              </TabsTrigger>
            </TabsList>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Prevent premature form submit on Enter for steps < maxSteps
                  if (currentStep < maxSteps) {
                    e.preventDefault();
                  }
                }
              }}
            >
              <TabsContent value="intern">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" {...register("name")} />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Create password" {...register("password")} />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" {...register("phone")} />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new-york">New York</SelectItem>
                              <SelectItem value="san-francisco">San Francisco</SelectItem>
                              <SelectItem value="london">London</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="agreeToTerms"
                        control={control}
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                      />
                      <label className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link href="/terms" className="text-teal-600 underline">
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-teal-600 underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Share your skills and interests</h3>
                      <p className="text-gray-600">Help us find your perfect internship match</p>
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {profilePicture ? (
                          <Image
                            src={URL.createObjectURL(profilePicture) || "/placeholder.svg"}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Users className="w-12 h-12 text-gray-400" />
                        )}
                        <label
                          htmlFor="profile-picture-upload"
                          className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-1 cursor-pointer hover:bg-teal-700"
                        >
                          <Plus className="w-4 h-4" />
                          <input
                            id="profile-picture-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null, "profilePicture")}
                          />
                        </label>
                      </div>
                      <span className="text-sm text-gray-600">Profile Picture</span>
                    </div>

                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        {...register("dateOfBirth")}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Gender</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.gender && (
                        <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <Label>Education</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentEducation = watch("education") || [];
                            setValue("education", [
                              ...currentEducation,
                              {
                                institution: "",
                                degree: "",
                                fieldOfStudy: "",
                                startDate: "",
                                isCurrent: false,
                              },
                            ]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Education
                        </Button>
                      </div>
                      
                      {watch("education")?.map((edu, index) => (
                        <div key={index} className="mt-4 p-4 border rounded-lg space-y-3">
                          <div>
                            <Label>Institution</Label>
                            <Input
                              {...register(`education.${index}.institution`)}
                              placeholder="e.g., University of California, Berkeley"
                            />
                            {errors.education?.[index]?.institution && (
                              <p className="text-sm text-red-500">
                                {errors.education[index]?.institution?.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Degree</Label>
                              <Input
                                {...register(`education.${index}.degree`)}
                                placeholder="e.g., Bachelor's"
                              />
                              {errors.education?.[index]?.degree && (
                                <p className="text-sm text-red-500">
                                  {errors.education[index]?.degree?.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label>Field of Study</Label>
                              <Input
                                {...register(`education.${index}.fieldOfStudy`)}
                                placeholder="e.g., Computer Science"
                              />
                              {errors.education?.[index]?.fieldOfStudy && (
                                <p className="text-sm text-red-500">
                                  {errors.education[index]?.fieldOfStudy?.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                {...register(`education.${index}.startDate`)}
                              />
                              {errors.education?.[index]?.startDate && (
                                <p className="text-sm text-red-500">
                                  {errors.education[index]?.startDate?.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                {...register(`education.${index}.endDate`)}
                                disabled={watch(`education.${index}.isCurrent`)}
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                  id={`current-${index}`}
                                  checked={watch(`education.${index}.isCurrent`)}
                                  onCheckedChange={(checked) => {
                                    setValue(`education.${index}.isCurrent`, Boolean(checked));
                                    if (checked) {
                                      setValue(`education.${index}.endDate`, "");
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`current-${index}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Currently enrolled
                                </label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label>GPA (optional)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="4"
                              {...register(`education.${index}.gpa`)}
                              placeholder="e.g., 3.5"
                            />
                            {errors.education?.[index]?.gpa && (
                              <p className="text-sm text-red-500">
                                {errors.education[index]?.gpa?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label>Description (optional)</Label>
                            <textarea
                              {...register(`education.${index}.description`)}
                              className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Relevant coursework, achievements, etc."
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const currentEducation = watch("education") || [];
                              setValue(
                                "education",
                                currentEducation.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            Remove Education
                          </Button>
                        </div>
                      ))}
                      
                      {errors.education && !Array.isArray(errors.education) && (
                        <p className="text-sm text-red-500 mt-1">{errors.education.message}</p>
                      )}
                    </div>


                    <div>
                      <Label>Skills</Label>
                      <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value?.map((skill, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    className="ml-2 text-gray-500 hover:text-red-500"
                                    onClick={() => {
                                      const newSkills = [...field.value];
                                      newSkills.splice(index, 1);
                                      field.onChange(newSkills);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex">
                              <Input
                                type="text"
                                placeholder="Add a skill and press Enter"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    e.preventDefault();
                                    field.onChange([
                                      ...(field.value || []),
                                      e.currentTarget.value.trim(),
                                    ]);
                                    e.currentTarget.value = '';
                                  }
                                }}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        )}
                      />
                      {errors.skills && (
                        <p className="text-sm text-red-500 mt-1">{errors.skills.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Preferred Industries</Label>
                      <Controller
                        name="preferredIndustries"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              if (!field.value) {
                                field.onChange([value]);
                              } else if (!field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                              }
                            }}
                            value=""
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industries" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                'Technology',
                                'Finance',
                                'Healthcare',
                                'Education',
                                'Marketing',
                                'Design',
                                'Engineering',
                                'Business',
                              ].map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {watch("preferredIndustries")?.map((industry, index) => (
                          <div
                            key={index}
                            className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {industry}
                            <button
                              type="button"
                              className="ml-2 text-teal-600 hover:text-teal-900"
                              onClick={() => {
                                const current = watch("preferredIndustries") || [];
                                setValue(
                                  "preferredIndustries",
                                  current.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.preferredIndustries && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.preferredIndustries.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., New York, Remote"
                        {...register("location")}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Work Authorization</Label>
                      <Controller
                        name="workAuthorization"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work authorization" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us-citizen">US Citizen</SelectItem>
                              <SelectItem value="permanent-resident">Permanent Resident</SelectItem>
                              <SelectItem value="work-visa">Work Visa</SelectItem>
                              <SelectItem value="student-visa">Student Visa (F-1, etc.)</SelectItem>
                              <SelectItem value="requires-sponsorship">Requires Sponsorship</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.workAuthorization && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.workAuthorization.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Availability</Label>
                      <Controller
                        name="availability"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediately">Immediately Available</SelectItem>
                              <SelectItem value="1-month">Available in 1 Month</SelectItem>
                              <SelectItem value="3-months">Available in 3 Months</SelectItem>
                              <SelectItem value="6-months">Available in 6+ Months</SelectItem>
                              <SelectItem value="flexible">Flexible Start Date</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.availability && (
                        <p className="text-sm text-red-500 mt-1">{errors.availability.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="relocation"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="relocation"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="relocation">Willing to relocate for the right opportunity</Label>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Complete your profile</h3>
                      <p className="text-gray-600">Add the finishing touches to stand out</p>
                    </div>

                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedinUrl"
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...register("linkedinUrl")}
                      />
                      {"linkedinUrl" in errors && errors.linkedinUrl && (
                        <p className="text-sm text-red-500 mt-1">{errors.linkedinUrl.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="website">Personal Website URL</Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        {...register("website")}
                      />
                      {"website" in errors && errors.website && (
                        <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="about">Bio</Label>
                      <textarea
                        id="about"
                        placeholder="Tell us about yourself, your interests, and what you're looking for in an internship..."
                        {...register("about")}
                        className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {"about" in errors && errors.about && (
                        <p className="text-sm text-red-500 mt-1">{errors.about.message}</p>
                      )}
                    </div>

                    {/* CV Upload */}
                    <div>
                      <Label>Upload Your CV</Label>
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors mt-2">
                        <FileText className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">{cv ? cv.name : "Click to upload your CV"}</span>
                        <span className="text-xs text-gray-500">PDF format recommended</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null, "cv")}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="company">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Company Name</Label>
                      <Input id="name" placeholder="Acme Inc." {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Company Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@acme.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Create password" {...register("password")} />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new-york">New York</SelectItem>
                              <SelectItem value="san-francisco">San Francisco</SelectItem>
                              <SelectItem value="london">London</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="agreeToTerms"
                        control={control}
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                      />
                      <label className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link href="/terms" className="text-teal-600 underline">
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-teal-600 underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Tell us about your company</h3>
                      <p className="text-gray-600">Help interns understand what makes you unique</p>
                    </div>

                    {/* Company Logo Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                        {logo ? (
                          <Image
                            src={URL.createObjectURL(logo) || "/placeholder.svg"}
                            alt="Company Logo"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building className="w-12 h-12 text-gray-400" />
                        )}
                        <label
                          htmlFor="logo-upload"
                          className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-1 cursor-pointer hover:bg-teal-700"
                        >
                          <Plus className="w-4 h-4" />
                          <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null, "logo")}
                          />
                        </label>
                      </div>
                      <span className="text-sm text-gray-600">Company Logo</span>
                    </div>

                    <div>
                      <Label>Company Type</Label>
                      <Controller
                        name="companyType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="startup">Startup</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                              <SelectItem value="agency">Agency</SelectItem>
                              <SelectItem value="non-profit">Non-profit</SelectItem>
                              <SelectItem value="educational">Educational</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {"companyType" in errors && errors.companyType && (
                        <p className="text-sm text-red-500 mt-1">{errors.companyType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Technology, Healthcare, Finance"
                        {...register("industry")}
                      />
                      {"industry" in errors && errors.industry && (
                        <p className="text-sm text-red-500 mt-1">{errors.industry.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Technology, Healthcare, Finance"
                        {...register("industry")}
                      />
                      {"industry" in errors && errors.industry && (
                        <p className="text-sm text-red-500 mt-1">{errors.industry.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://www.acme.com" {...register("website")} />
                      {"website" in errors && errors.website && (
                        <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactName">Contact Person</Label>
                      <Input id="contactName" placeholder="Jane Smith" {...register("name")} />
                      {"name" in errors && errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input id="jobTitle" placeholder="HR Manager" {...register("about")} />
                      {"about" in errors && errors.about && (
                        <p className="text-sm text-red-500 mt-1">{errors.about.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" type="email" placeholder="jane@acme.com" {...register("contactEmail")} />
                      {"contactEmail" in errors && errors.contactEmail && (
                        <p className="text-sm text-red-500 mt-1">{errors.contactEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" placeholder="+1 (555) 123-4567" {...register("contactPhone")} />
                      {"contactPhone" in errors && errors.contactPhone && (
                        <p className="text-sm text-red-500 mt-1">{errors.contactPhone.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Final details</h3>
                      <p className="text-gray-600">Complete your company profile</p>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        {...register("location")}
                      />
                      {"location" in errors && errors.location && (
                        <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="workEnvironment">Work Environment</Label>
                      <Input
                        id="workEnvironment"
                        placeholder="e.g., On-site, Remote, Hybrid"
                        {...register("location")}
                      />
                      {"location" in errors && errors.location && (
                        <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Company Description</Label>
                      <textarea
                        id="description"
                        placeholder="Tell us about your company, mission, and culture..."
                        {...register("description")}
                        className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {"description" in errors && errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Company Size</Label>
                      <Controller
                        name="companySize"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                              <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                              <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                              <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                              <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                              <SelectItem value="1001-5000 employees">1001-5000 employees</SelectItem>
                              <SelectItem value="5001-10,000 employees">5001-10,000 employees</SelectItem>
                              <SelectItem value="10,001+ employees">10,001+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {"companySize" in errors && errors.companySize && (
                        <p className="text-sm text-red-500 mt-1">{errors.companySize.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="openPositions">Open Positions</Label>
                      <Input
                        id="openPositions"
                        placeholder="e.g., Software Engineer Intern, Marketing Intern"
                        {...register("description")}
                      />
                      {"description" in errors && errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Internship Duration</Label>
                      <Controller
                        name="internshipDuration"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-3-months">1-3 Months</SelectItem>
                              <SelectItem value="3-6-months">3-6 Months</SelectItem>
                              <SelectItem value="6-12-months">6-12 Months</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {"internshipDuration" in errors && errors.internshipDuration && (
                        <p className="text-sm text-red-500 mt-1">{errors.internshipDuration.message}</p>
                      )}
                    </div>

                    {/* Company form does not collect salary expectations; removed invalid fields */}
                  </div>
                )}
              </TabsContent>

              {/* Form Navigation */}
              <div className="mt-8 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>

                {currentStep < maxSteps ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(maxSteps, currentStep + 1))}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                )}
              </div>
            </form>
          </Tabs>

          <div className="text-center mt-6 pt-6 border-t">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 font-medium underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-600 to-blue-700 p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6">
            {activeTab === "intern" ? "Find Your Dream Internship" : "Discover Top Talent"}
          </h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            {author && <p className="text-teal-100">{author}</p>}
          </div>

          <div className="space-y-6 text-left">
            {activeTab === "intern" ? (
              <>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Personalized Matches</h4>
                    <p className="text-teal-100 text-sm">Find internships that match your skills and interests</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Career Growth</h4>
                    <p className="text-teal-100 text-sm">
                      Gain valuable experience and build your professional network
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Easy Application</h4>
                    <p className="text-teal-100 text-sm">
                      Apply to multiple internships with one comprehensive profile
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Top Talent</h4>
                    <p className="text-teal-100 text-sm">Connect with highly motivated students and graduates</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Easy Hiring</h4>
                    <p className="text-teal-100 text-sm">Streamline your internship recruitment process</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Quality Matches</h4>
                    <p className="text-teal-100 text-sm">Find interns who align with your company culture and needs</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
