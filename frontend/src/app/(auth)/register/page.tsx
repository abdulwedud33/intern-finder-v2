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
import { toast } from "sonner"
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
  social: z.object({
    linkedin: z.string().default(''),
    portfolio: z.string().default(''),
    github: z.string().default('')
  }).optional().default(() => ({ linkedin: '', portfolio: '', github: '' })),
  
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
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  emailVerificationToken: z.string().optional(),
  emailVerificationExpire: z.date().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpire: z.date().optional(),
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
    github: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
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
  
  // Verification & Status
  isVerified: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  
  // Ratings & Reviews
  rating: z.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5")
    .default(1),
    
  reviewCount: z.number().default(0),
  
  // System Fields
  lastActive: z.date().optional(),
  emailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"intern" | "company">("intern")
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
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
      education: activeTab === "intern" ? [{
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        isCurrent: false,
      }] : [],
      skills: activeTab === "intern" ? [] : [],
      preferredIndustries: [],
    } as any)
    setCurrentStep(1)
  }, [activeTab, reset])

  // Handle file upload
  const handleFileChange = (file: File | null, type: "profilePicture" | "cv" | "logo") => {
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "application/pdf"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPEG, PNG, or PDF file",
      })
      return
    }

    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB",
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

  // Handle step progression with validation
  const handleNextStep = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsNavigating(true);
    
    // Validate current step fields before proceeding
    const fieldsToValidate = getFieldsForCurrentStep();
    const isValid = await trigger(fieldsToValidate);
    
    if (!isValid) {
      // Get specific error messages for empty required fields
      const formValues = watch();
      const emptyFields = getEmptyRequiredFields(formValues, currentStep, activeTab);
      
      toast.error("Registration Failed", {
        description: `Please fill in the following required fields: ${emptyFields.join(', ')}`,
      });
      setIsNavigating(false);
      return;
    }
    
    setCurrentStep(Math.min(maxSteps, currentStep + 1));
    setIsNavigating(false);
  };

  // Get empty required fields for current step or all steps
  const getEmptyRequiredFields = (formValues: any, step: number, tab: string, checkAllSteps: boolean = false) => {
    const emptyFields: string[] = [];
    
    if (tab === "intern") {
      // Always check step 1 fields
      if (checkAllSteps || step === 1) {
        if (!formValues.name?.trim()) emptyFields.push("Full Name");
        if (!formValues.email?.trim()) emptyFields.push("Email Address");
        if (!formValues.password?.trim()) emptyFields.push("Password");
        if (!formValues.confirmPassword?.trim()) emptyFields.push("Confirm Password");
        if (!formValues.phone?.trim()) emptyFields.push("Phone Number");
        if (!formValues.location?.trim()) emptyFields.push("Location");
        if (!formValues.agreeToTerms) emptyFields.push("Terms Agreement");
      }
      
      // Always check step 2 fields
      if (checkAllSteps || step === 2) {
        if (!formValues.dateOfBirth?.trim()) emptyFields.push("Date of Birth");
        if (!formValues.gender?.trim()) emptyFields.push("Gender");
        if (!formValues.education || formValues.education.length === 0 || 
            !formValues.education[0]?.institution?.trim()) emptyFields.push("Education Institution");
        if (!formValues.skills || formValues.skills.length === 0) emptyFields.push("Skills");
        if (!formValues.workAuthorization?.trim()) emptyFields.push("Work Authorization");
      }
      
      // Step 3 fields are optional for intern
    } else {
      // Always check step 1 fields
      if (checkAllSteps || step === 1) {
        if (!formValues.name?.trim()) emptyFields.push("Company Name");
        if (!formValues.email?.trim()) emptyFields.push("Company Email");
        if (!formValues.password?.trim()) emptyFields.push("Password");
        if (!formValues.confirmPassword?.trim()) emptyFields.push("Confirm Password");
        if (!formValues.phone?.trim()) emptyFields.push("Phone Number");
        if (!formValues.location?.trim()) emptyFields.push("Location");
        if (!formValues.agreeToTerms) emptyFields.push("Terms Agreement");
      }
      
      // Always check step 2 fields
      if (checkAllSteps || step === 2) {
        if (!formValues.industry?.trim()) emptyFields.push("Industry");
        if (!formValues.description?.trim()) emptyFields.push("Company Description");
        if (!formValues.contactEmail?.trim()) emptyFields.push("Contact Email");
        if (!formValues.contactPhone?.trim()) emptyFields.push("Contact Phone");
      }
      
      // Step 3 fields are optional for company
    }
    
    return emptyFields;
  };

  // Get fields to validate for current step
  const getFieldsForCurrentStep = () => {
    if (activeTab === "intern") {
      switch (currentStep) {
        case 1:
          return ["name", "email", "password", "confirmPassword", "phone", "location", "agreeToTerms"];
        case 2:
          return ["dateOfBirth", "gender", "education", "skills", "workAuthorization"];
        case 3:
          return ["linkedinUrl", "website", "about"];
        default:
          return [];
      }
    } else {
      switch (currentStep) {
        case 1:
          return ["name", "email", "password", "confirmPassword", "phone", "location", "agreeToTerms"];
        case 2:
          return ["industry", "description", "contactEmail", "contactPhone"];
        case 3:
          return ["companySize", "description"];
        default:
          return [];
      }
    }
  };

  // Handle form submission
  const onSubmit: SubmitHandler<any> = async (data) => {
    console.log('Form submission started, current step:', currentStep, 'isNavigating:', isNavigating);
    
    // Only submit on the final step and when not navigating
    if (currentStep !== maxSteps || isNavigating) {
      console.log('Not on final step or currently navigating, skipping submission');
      return;
    }
    
    // Trigger validation for all fields
    const isValid = await trigger();
    if (!isValid) {
      console.error('Form validation failed - preventing submission');
      
      // Get specific error messages for empty required fields
      const formValues = watch();
      const emptyFields = getEmptyRequiredFields(formValues, currentStep, activeTab);
      
      toast.error("Registration Failed", {
        description: `Please fill in the following required fields: ${emptyFields.join(', ')}`,
      });
      return;
    }

    // Additional validation check - ensure no required fields are empty from ALL steps
    const formValues = watch();
    const emptyFields = getEmptyRequiredFields(formValues, currentStep, activeTab, true);
    if (emptyFields.length > 0) {
      console.error('Required fields are empty - preventing submission');
      toast.error("Registration Failed", {
        description: `Please fill in the following required fields: ${emptyFields.join(', ')}`,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Log the form data for debugging (omit files)
      console.log('✅ All validations passed - submitting register data for role:', data.role);
      
      // Build FormData payload for file upload
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = `/api/auth/register/${data.role === 'intern' ? 'intern' : 'company'}`;
      
      const formData = new FormData();
      
      // Add common fields
      formData.append('role', data.role);
      formData.append('name', (data as any).name);
      formData.append('email', (data as any).email);
      formData.append('password', (data as any).password);
      formData.append('phone', (data as any).phone);
      
      // Add avatar file
      if (data.role === 'intern' && profilePicture) {
        formData.append('avatar', profilePicture);
      } else if (data.role === 'company' && logo) {
        formData.append('logo', logo);
      }
      
      // Add role-specific fields
      if (data.role === 'intern') {
        formData.append('dateOfBirth', (data as any).dateOfBirth);
        formData.append('gender', (data as any).gender);
        formData.append('location', (data as any).location);
        formData.append('about', (data as any).about || '');
        formData.append('website', (data as any).website || '');
        formData.append('linkedinUrl', (data as any).linkedinUrl || '');
        
        // Add education array
        const education = (data as any).education?.map((e: any) => ({
              institution: e.institution,
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              startDate: e.startDate,
              endDate: e.endDate || undefined,
              isCurrent: Boolean(e.isCurrent),
        }));
        formData.append('education', JSON.stringify(education));
        
        // Add skills array
        const skills = (data as any).skills?.map((s: any) => (typeof s === 'string' ? { name: s } : { name: s.name }));
        formData.append('skills', JSON.stringify(skills));
        
        // Add experience array (if present)
        if ((data as any).experience) {
          formData.append('experience', JSON.stringify((data as any).experience));
        }
        
        // Add languages array (if present)
        if ((data as any).languages) {
          formData.append('languages', JSON.stringify((data as any).languages));
        }
        
        // Add CV file if present
        if (cv) {
          formData.append('resume', cv);
        }
        
        // Add cover letter if present (though not currently collected in form)
        if ((data as any).coverLetter) {
          formData.append('coverLetter', (data as any).coverLetter);
        }
        
        // Add work authorization
        if ((data as any).workAuthorization) {
          formData.append('workAuthorization', (data as any).workAuthorization);
        }
        
        // Add availability
        if ((data as any).availability) {
          formData.append('availability', (data as any).availability);
        }
        
        // Add preferred industries
        if ((data as any).preferredIndustries) {
          formData.append('preferredIndustries', JSON.stringify((data as any).preferredIndustries));
        }
        
        // Add relocation preference
        if ((data as any).relocation !== undefined) {
          formData.append('relocation', String((data as any).relocation));
        }
        
        // Add job preferences
        if ((data as any).jobPreferences) {
          formData.append('jobPreferences', JSON.stringify((data as any).jobPreferences));
        }

        // Add social object (map from separate social fields)
        const socialData = {
          linkedin: (data as any).linkedinUrl || '',
          portfolio: (data as any).portfolioUrl || '',
          github: (data as any).githubUrl || ''
        };
        formData.append('social', JSON.stringify(socialData));
      } else {
        // Company registration fields
        formData.append('industry', (data as any).industry);
        formData.append('description', (data as any).description);
        formData.append('location', (data as any).location);
        formData.append('website', (data as any).website || '');
        formData.append('contactEmail', (data as any).contactEmail || '');
        formData.append('contactPhone', (data as any).contactPhone || '');
        formData.append('rating', '1'); // Default rating for new companies
        
        // Company size
        if ((data as any).companySize) {
          formData.append('companySize', (data as any).companySize);
        }
        
        // Founded year
        if ((data as any).foundedYear) {
          formData.append('foundedYear', String((data as any).foundedYear));
        }
        
        // Company type
        if ((data as any).companyType) {
          formData.append('companyType', (data as any).companyType);
        }
        
        // Headquarters
        if ((data as any).headquarters) {
          formData.append('headquarters', JSON.stringify((data as any).headquarters));
        }
        
        // Social media
        if ((data as any).socialMedia) {
          formData.append('socialMedia', JSON.stringify((data as any).socialMedia));
        }
        
        // Company culture
        if ((data as any).values) {
          formData.append('values', JSON.stringify((data as any).values));
        }
        if ((data as any).mission) {
          formData.append('mission', (data as any).mission);
        }
        if ((data as any).vision) {
          formData.append('vision', (data as any).vision);
        }
        if ((data as any).culture) {
          formData.append('culture', (data as any).culture);
        }
        
        // Additional info
        if ((data as any).specialties) {
          formData.append('specialties', JSON.stringify((data as any).specialties));
        }
        if ((data as any).benefits) {
          formData.append('benefits', JSON.stringify((data as any).benefits));
        }
        if ((data as any).technologies) {
          formData.append('technologies', JSON.stringify((data as any).technologies));
        }
        
        
        // Verification status
        formData.append('isVerified', 'false');
        formData.append('isFeatured', 'false');
        formData.append('reviewCount', '0');
        
        // Add social object (map from socialMedia object)
        if ((data as any).socialMedia) {
          formData.append('social', JSON.stringify((data as any).socialMedia));
        } else {
          // Default social object
          formData.append('social', JSON.stringify({
            linkedin: '',
            portfolio: '',
            github: ''
          }));
        }

      }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Create error object with response data for better error handling
        const error = new Error(resData?.message || 'Registration failed');
        (error as any).response = { data: resData };
        (error as any).status = res.status;
        throw error;
      }
        
        toast.success('Registration Successful! 🎉', {
        description: `Your ${data.role} account has been created successfully. You can now log in with your credentials.`,
        duration: 5000,
      });

      // Backend sets an auth cookie on register; clear it so header doesn't show logged-in
      try {
        await fetch(`${baseUrl}/api/auth/logout`, { credentials: 'include' });
      } catch (_) {}

      router.push('/login');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "An unexpected error occurred during registration. Please try again.";
      let isDuplicateEmail = false;
      
      if (error.name === 'NetworkError') {
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        // Check if it's a duplicate email error
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('already') || 
             errorMessage.toLowerCase().includes('exists') ||
             errorMessage.toLowerCase().includes('duplicate'))) {
          isDuplicateEmail = true;
        }
      } else if (error.message) {
        errorMessage = error.message;
        // Check if it's a duplicate email error
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('already') || 
             errorMessage.toLowerCase().includes('exists') ||
             errorMessage.toLowerCase().includes('duplicate'))) {
          isDuplicateEmail = true;
        }
      }
      
      // Also check for common HTTP status codes that indicate duplicate entries
      if (error.status === 409 || error.status === 422) {
        isDuplicateEmail = true;
        errorMessage = "An account with this email already exists. Please log in instead.";
      }
      
      if (isDuplicateEmail) {
        toast.error("Email Already Exists", {
          description: "An account with this email already exists. Redirecting to login...",
          duration: 5000,
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error("Registration Failed", {
        description: errorMessage,
          duration: 5000,
      });
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex">
      {/* Left Panel - Form */}
      <div className="w-full md:w-1/2 p-8 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <div className="text-center mb-8">
              {activeTab === "intern" ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-400 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-400 rounded-2xl mb-4">
                 <Building className="w-8 h-8 text-white" />
                </div>
              )}
              <h1 className="text-4xl font-bold bg-teal-500 bg-clip-text text-transparent mb-3">Create an Account</h1>
              <p className="text-gray-600 text-lg">
              {activeTab === "intern"
                ? "Join as an intern and find your dream opportunity"
                : "Register your company and find talented interns"}
            </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {maxSteps}
              </span>
              <span className="text-sm font-medium text-teal-600">{Math.round((currentStep / maxSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-teal-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / maxSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step <= currentStep
                      ? 'bg-teal-400 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="intern" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-600 transition-all duration-200 rounded-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Intern
              </TabsTrigger>
              <TabsTrigger 
                value="company"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-600 transition-all duration-200 rounded-lg"
              >
                <Building className="w-4 h-4 mr-2" />
                Company
              </TabsTrigger>
            </TabsList>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <TabsContent value="intern">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl border border-teal-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        Basic Information
                      </h3>
                  <div className="space-y-4">
                    <div>
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe" 
                            {...register("name")} 
                            className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>}
                    </div>

                    <div>
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="john@example.com" 
                            {...register("email")} 
                            className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></Label>
                            <Input 
                              id="password" 
                              type="password" 
                              placeholder="Create password" 
                              {...register("password")} 
                              className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                            />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>}
                      </div>
                      <div>
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          {...register("confirmPassword")}
                              className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message as string}</p>
                        )}
                      </div>
                    </div>

                    <div>
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
                          <Input 
                            id="phone" 
                            placeholder="+1 (555) 123-4567" 
                            {...register("phone")} 
                            className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message as string}</p>}
                    </div>

                    <div>
                          <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></Label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="location"
                            placeholder="Enter your location (e.g., New York, NY or Remote)"
                            className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          />
                        )}
                      />
                      {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>}
                    </div>

                        <div className="flex items-center space-x-2 pt-2">
                      <Controller
                        name="agreeToTerms"
                        control={control}
                            render={({ field }) => (
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                className="border-gray-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                              />
                            )}
                      />
                      <label className="text-sm text-gray-600">
                        I agree to the{" "}
                            <Link href="/terms" className="text-teal-600 underline hover:text-teal-700">
                          Terms
                        </Link>{" "}
                        and{" "}
                            <Link href="/privacy" className="text-teal-600 underline hover:text-teal-700">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms.message as string}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                        <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        Share your skills and interests
                      </h3>
                      <p className="text-gray-600 ml-11">Help us find your perfect internship match</p>
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.gender.message as string}</p>
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
                      
                      {watch("education")?.map((edu: any, index: number) => (
                        <div key={index} className="mt-4 p-4 border rounded-lg space-y-3">
                          <div>
                            <Label>Institution</Label>
                            <Input
                              {...register(`education.${index}.institution`)}
                              placeholder="e.g., University of California, Berkeley"
                            />
                            {(errors.education as any)?.[index]?.institution && (
                              <p className="text-sm text-red-500">
                                {(errors.education as any)?.[index]?.institution?.message as string}
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
                              {(errors.education as any)?.[index]?.degree && (
                                <p className="text-sm text-red-500">
                                  {(errors.education as any)?.[index]?.degree?.message as string}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label>Field of Study</Label>
                              <Input
                                {...register(`education.${index}.fieldOfStudy`)}
                                placeholder="e.g., Computer Science"
                              />
                              {(errors.education as any)?.[index]?.fieldOfStudy && (
                                <p className="text-sm text-red-500">
                                  {(errors.education as any)?.[index]?.fieldOfStudy?.message as string}
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
                              {(errors.education as any)?.[index]?.startDate && (
                                <p className="text-sm text-red-500">
                                  {(errors.education as any)?.[index]?.startDate?.message as string}
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
                            {(errors.education as any)?.[index]?.gpa && (
                              <p className="text-sm text-red-500">
                                {(errors.education as any)?.[index]?.gpa?.message as string}
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
                                currentEducation.filter((_: any, i: number) => i !== index)
                              );
                            }}
                          >
                            Remove Education
                          </Button>
                        </div>
                      ))}
                      
                      {errors.education && !Array.isArray(errors.education) && (
                        <p className="text-sm text-red-500 mt-1">{errors.education.message as string}</p>
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
                              {field.value?.map((skill: any, index: number) => (
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
                        <p className="text-sm text-red-500 mt-1">{errors.skills.message as string}</p>
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
                        {watch("preferredIndustries")?.map((industry: any, index: number) => (
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
                                  current.filter((_: any, i: number) => i !== index)
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
                          {errors.preferredIndustries.message as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., New York, Remote"
                        {...register("location")}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.location.message as string}
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
                          {errors.workAuthorization.message as string}
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
                        <p className="text-sm text-red-500 mt-1">{errors.availability.message as string}</p>
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

                    <div>
                      <div className="flex justify-between items-center">
                        <Label>Work Experience</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentExperience = watch("experience") || [];
                            setValue("experience", [
                              ...currentExperience,
                              {
                                title: "",
                                company: "",
                                location: "",
                                startDate: "",
                                isCurrent: false,
                              },
                            ]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Experience
                        </Button>
                      </div>
                      
                      {watch("experience")?.map((exp: any, index: number) => (
                        <div key={index} className="mt-4 p-4 border rounded-lg space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Job Title</Label>
                              <Input
                                {...register(`experience.${index}.title`)}
                                placeholder="e.g., Software Developer Intern"
                              />
                            </div>
                            <div>
                              <Label>Company</Label>
                              <Input
                                {...register(`experience.${index}.company`)}
                                placeholder="e.g., Google"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Location</Label>
                            <Input
                              {...register(`experience.${index}.location`)}
                              placeholder="e.g., San Francisco, CA"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                {...register(`experience.${index}.startDate`)}
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                {...register(`experience.${index}.endDate`)}
                                disabled={watch(`experience.${index}.isCurrent`)}
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                  id={`current-exp-${index}`}
                                  checked={watch(`experience.${index}.isCurrent`)}
                                  onCheckedChange={(checked) => {
                                    setValue(`experience.${index}.isCurrent`, Boolean(checked));
                                    if (checked) {
                                      setValue(`experience.${index}.endDate`, "");
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`current-exp-${index}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Currently working here
                                </label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label>Description (optional)</Label>
                            <textarea
                              {...register(`experience.${index}.description`)}
                              className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Describe your responsibilities and achievements"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const currentExperience = watch("experience") || [];
                              setValue(
                                "experience",
                                currentExperience.filter((_: any, i: number) => i !== index)
                              );
                            }}
                          >
                            Remove Experience
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Languages</Label>
                      <Controller
                        name="languages"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value?.map((language: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {language.name} ({language.proficiency})
                                  <button
                                    type="button"
                                    className="ml-2 text-green-600 hover:text-green-900"
                                    onClick={() => {
                                      const newLanguages = [...field.value];
                                      newLanguages.splice(index, 1);
                                      field.onChange(newLanguages);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Language name"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    e.preventDefault();
                                    const languageName = e.currentTarget.value.trim();
                                    e.currentTarget.value = '';
                                    
                                    // Find proficiency input
                                    const proficiencyInput = e.currentTarget.parentElement?.querySelector('select') as HTMLSelectElement;
                                    const proficiency = proficiencyInput?.value || 'intermediate';
                                    
                                    field.onChange([
                                      ...(field.value || []),
                                      { name: languageName, proficiency }
                                    ]);
                                    proficiencyInput.value = 'intermediate';
                                  }
                                }}
                                className="flex-1"
                              />
                              <Select defaultValue="intermediate">
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="native">Native</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                        <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        Complete your profile
                      </h3>
                      <p className="text-gray-600 ml-11">Add the finishing touches to stand out</p>
                    </div>

                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedinUrl"
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...register("linkedinUrl")}
                      />
                      {"linkedinUrl" in errors && errors.linkedinUrl && (
                        <p className="text-sm text-red-500 mt-1">{errors.linkedinUrl.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.website.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.about.message as string}</p>
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

                    <div>
                      <div className="space-y-4">
                        <div>
                          <Label>Preferred Job Types</Label>
                          <Controller
                            name="jobPreferences.jobTypes"
                            control={control}
                            render={({ field }) => (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {field.value?.map((type: any, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                      {type}
                                      <button
                                        type="button"
                                        className="ml-2 text-indigo-600 hover:text-indigo-900"
                                        onClick={() => {
                                          const newTypes = [...field.value];
                                          newTypes.splice(index, 1);
                                          field.onChange(newTypes);
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex">
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
                                      <SelectValue placeholder="Select job types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['full-time', 'part-time', 'contract', 'freelance', 'internship'].map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Preferred Locations</Label>
                          <Controller
                            name="jobPreferences.locations"
                            control={control}
                            render={({ field }) => (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {field.value?.map((location: any, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                      {location}
                                      <button
                                        type="button"
                                        className="ml-2 text-orange-600 hover:text-orange-900"
                                        onClick={() => {
                                          const newLocations = [...field.value];
                                          newLocations.splice(index, 1);
                                          field.onChange(newLocations);
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
                                    placeholder="Add a location and press Enter"
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
                        </div>

                        <div className="flex items-center space-x-2">
                          <Controller
                            name="jobPreferences.remote"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="remote"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="remote">Open to remote work</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Controller
                            name="jobPreferences.remoteOnly"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="remoteOnly"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="remoteOnly">Remote work only</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="company">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl border border-teal-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        Company Information
                      </h3>
                  <div className="space-y-4">
                    <div>
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></Label>
                          <Input 
                            id="name" 
                            placeholder="Acme Inc." 
                            {...register("name")} 
                            className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Create password" {...register("password")} />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>}
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
                          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message as string}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" {...register("phone")} />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message as string}</p>}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="location"
                            placeholder="Enter company location (e.g., New York, NY or Remote)"
                            className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          />
                        )}
                      />
                      {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>}
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
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms.message as string}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                        <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        Tell us about your company
                      </h3>
                      <p className="text-gray-600 ml-11">Help interns understand what makes you unique</p>
                    </div>

                    {/* Company Logo Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center">
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
                        <p className="text-sm text-red-500 mt-1">{errors.companyType.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.industry.message as string}</p>
                      )}
                    </div>


                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://www.acme.com" {...register("website")} />
                      {"website" in errors && errors.website && (
                        <p className="text-sm text-red-500 mt-1">{errors.website.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactName">Contact Person</Label>
                      <Input id="contactName" placeholder="Jane Smith" {...register("name")} />
                      {"name" in errors && errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input id="jobTitle" placeholder="HR Manager" {...register("about")} />
                      {"about" in errors && errors.about && (
                        <p className="text-sm text-red-500 mt-1">{errors.about.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" type="email" placeholder="jane@acme.com" {...register("contactEmail")} />
                      {"contactEmail" in errors && errors.contactEmail && (
                        <p className="text-sm text-red-500 mt-1">{errors.contactEmail.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" placeholder="+1 (555) 123-4567" {...register("contactPhone")} />
                      {"contactPhone" in errors && errors.contactPhone && (
                        <p className="text-sm text-red-500 mt-1">{errors.contactPhone.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm mb-1 font-medium text-gray-700">Social Media Links</Label>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="socialMedia.linkedin">LinkedIn</Label>
                          <Input
                            id="socialMedia.linkedin"
                            placeholder="https://linkedin.com/company/yourcompany"
                            {...register("socialMedia.linkedin")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="socialMedia.twitter">Twitter</Label>
                          <Input
                            id="socialMedia.twitter"
                            placeholder="https://twitter.com/yourcompany"
                            {...register("socialMedia.twitter")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="socialMedia.github">GitHub</Label>
                          <Input
                            id="socialMedia.github"
                            placeholder="https://github.com/yourcompany"
                            {...register("socialMedia.github")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="socialMedia.facebook">Facebook</Label>
                          <Input
                            id="socialMedia.facebook"
                            placeholder="https://facebook.com/yourcompany"
                            {...register("socialMedia.facebook")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="socialMedia.instagram">Instagram</Label>
                          <Input
                            id="socialMedia.instagram"
                            placeholder="https://instagram.com/yourcompany"
                            {...register("socialMedia.instagram")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                        <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        Final details
                      </h3>
                      <p className="text-gray-600 ml-11">Complete your company profile</p>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        {...register("location")}
                      />
                      {"location" in errors && errors.location && (
                        <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.description.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.companySize.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="e.g., 2020"
                        {...register("foundedYear")}
                      />
                      {"foundedYear" in errors && errors.foundedYear && (
                        <p className="text-sm text-red-500 mt-1">{errors.foundedYear.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label>Company Headquarters</Label>
                      <div className="space-y-3">
                        <Input
                          placeholder="Street Address"
                          {...register("headquarters.address")}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="City"
                            {...register("headquarters.city")}
                          />
                          <Input
                            placeholder="State/Province"
                            {...register("headquarters.state")}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Country"
                            {...register("headquarters.country")}
                          />
                          <Input
                            placeholder="Postal Code"
                            {...register("headquarters.postalCode")}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mission">Mission Statement</Label>
                      <textarea
                        id="mission"
                        placeholder="What is your company's mission?"
                        {...register("mission")}
                        className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {"mission" in errors && errors.mission && (
                        <p className="text-sm text-red-500 mt-1">{errors.mission.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vision">Vision Statement</Label>
                      <textarea
                        id="vision"
                        placeholder="What is your company's vision for the future?"
                        {...register("vision")}
                        className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {"vision" in errors && errors.vision && (
                        <p className="text-sm text-red-500 mt-1">{errors.vision.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label>Company Values</Label>
                      <Controller
                        name="values"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value?.map((value: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {value}
                                  <button
                                    type="button"
                                    className="ml-2 text-gray-500 hover:text-red-500"
                                    onClick={() => {
                                      const newValues = [...field.value];
                                      newValues.splice(index, 1);
                                      field.onChange(newValues);
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
                                placeholder="Add a company value and press Enter"
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
                    </div>

                    <div>
                      <Label>Company Specialties</Label>
                      <Controller
                        name="specialties"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value?.map((specialty: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {specialty}
                                  <button
                                    type="button"
                                    className="ml-2 text-teal-600 hover:text-teal-900"
                                    onClick={() => {
                                      const newSpecialties = [...field.value];
                                      newSpecialties.splice(index, 1);
                                      field.onChange(newSpecialties);
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
                                placeholder="Add a specialty and press Enter"
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
                    </div>

                    <div>
                      <Label>Technologies Used</Label>
                      <Controller
                        name="technologies"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value?.map((tech: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {tech}
                                  <button
                                    type="button"
                                    className="ml-2 text-blue-600 hover:text-blue-900"
                                    onClick={() => {
                                      const newTechs = [...field.value];
                                      newTechs.splice(index, 1);
                                      field.onChange(newTechs);
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
                                placeholder="Add a technology and press Enter"
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
                    </div>

                    <div>
                      <Label>Employee Benefits</Label>
                      <Controller
                        name="benefits"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value?.map((benefit: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {benefit}
                                  <button
                                    type="button"
                                    className="ml-2 text-purple-600 hover:text-purple-900"
                                    onClick={() => {
                                      const newBenefits = [...field.value];
                                      newBenefits.splice(index, 1);
                                      field.onChange(newBenefits);
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
                                placeholder="Add a benefit and press Enter"
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
                    </div>

                    <div>
                      <Label htmlFor="culture">Company Culture</Label>
                      <textarea
                        id="culture"
                        placeholder="Describe your company culture, work environment, and team dynamics..."
                        {...register("culture")}
                        className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {"culture" in errors && errors.culture && (
                        <p className="text-sm text-red-500 mt-1">{errors.culture.message as string}</p>
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
                        <p className="text-sm text-red-500 mt-1">{errors.internshipDuration.message as string}</p>
                      )}
                    </div>

                    {/* Company form does not collect salary expectations; removed invalid fields */}
                  </div>
                )}
              </TabsContent>

              {/* Form Navigation */}
              <div className="mt-10 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>

                {currentStep < maxSteps ? (
                  <Button
                    type="button"
                    onClick={(e) => handleNextStep(e)}
                    disabled={isNavigating}
                    className="bg-teal-400 hover:bg-teal-600 active:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNextStep();
                      }
                    }}
                  >
                    {isNavigating ? (
                      <>
                        <svg className="animate-spin bg-teal-400 -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validating...
                      </>
                    ) : (
                      <>
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-teal-400 hover:bg-teal-600 active:bg-teal-700 text-white px-8 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </>
                    ) : (
                      <>
                        Register
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Tabs>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 font-medium underline hover:text-teal-700 transition-colors">
                Login here
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
