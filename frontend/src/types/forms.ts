import { CompanyProfile } from "./company"

export type CompanyProfileFormData = Omit<
  CompanyProfile, 
  '_id' | 'createdAt' | 'updatedAt' | 'teamMembers' | 'socialMedia'
> & {
  // Ensure all required fields are non-optional
  name: string
  website: string
  description: string
  industry: string
  phone: string
  primaryContact: string
  pressContact: string
  generalContact: string
  employees: string
  techStack: string[]
  officeLocations: Array<{
    address: string
    city: string
    country: string
    isHeadquarters?: boolean
  }>
}
