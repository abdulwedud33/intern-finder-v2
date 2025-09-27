import { Linkedin } from 'lucide-react';
import { Phone } from 'lucide-react';
// API Response Types
export interface ApiResponse<T = unknown> {
  ok: true
  status: number
  data: T
}

export interface ApiError {
  ok: false
  status: number
  error: string
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError

// Listing Types
export interface Listing {
  _id: string
  title: string
  description: string
  location: string
  categories: string[]
  typesOfEmployment: string[]
  salaryRange: {
    min?: number
    max?: number
    currency: string
  }
  keyResponsibilities: string[]
  professionalSkills: string[]
  status: string
  dueDate?: string
  capacity: number
  qualifications: string[]
  niceToHaves: string[]
  createdAt: string
  updatedAt: string
  __v: number
  company: {
    _id: string
    name: string
    profile: {
      _id: string
      logoUrl: string
    }
  }
  applicantsCount?: number
}

export interface ListingsResponse {
  success: boolean
  count: number
  pagination?: {
    total: number
    page: number
    limit: number
  }
  data: Listing[]
}

export interface SingleListingResponse {
  listing: Listing
}

// Profile Types
export interface InternProfile {
  _id: string
  name: string
  email: string
  role?: string
  profile: {
    _id: string
    profilePictureUrl?: string
    location?: string
    aboutMe?: string
    bio?: string
    description?: string
    currentJob?: string
    position?: string
    PhoneNumber?: string
    LinkedinUrl?: string
    portfolioWebsiteUrl?: string
    preferredRoles: string[]
    education?: string
    experiences: Experience[]
    educations: string[]
    portfolios: File[]
    notificationSettings: {
      applications: boolean
      jobs: boolean
      recommendations: boolean
    }
    skills: string[]
    languages: string[]
    instagram?: string
    twitter?: string
    portfolio?: string
    linkedin?: string
    __v: number
  }
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Experience {
  _id?: string
  id?: string
  title: string
  company: string
  startDate?: string
  endDate?: string
  location?: string
  description?: string
}

export interface InternProfileResponse {
  success: boolean
  data: InternProfile
}

// Flattened profile interface for easier use in components
export interface FlatInternProfile {
  _id: string
  name: string
  email: string
  role?: string
  PhoneNumber: string
  LinkedinUrl: string
  portfolioWebsiteUrl: string
  preferredRoles: string[]
  profilePictureUrl?: string
  location?: string
  aboutMe?: string
  bio?: string
  description?: string
  currentJob?: string
  position?: string
  education?: string
  languages: string[]
  skills: string[]
  experiences: Experience[]
  educations: string[]
  portfolios: File[]
  notificationSettings?: {
    applications: boolean
    jobs: boolean
    recommendations: boolean
  }
  instagram?: string
  twitter?: string
  linkedin?: string
  createdAt: string
  updatedAt: string
}
