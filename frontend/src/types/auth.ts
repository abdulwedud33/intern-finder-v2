export interface InternPayload {
  name: string
  email: string
  password: string
  location?: string
  // Backend requires 'phone' and 'internshipType'
  phone?: string
  institution?: string
  fieldOfStudy?: string
  program?: string
  internshipType?: string
  preferredRoles?: string[]
  linkedinUrl?: string
  personalWebsiteUrl?: string
  bio?: string
}

export interface CompanyPayload {
  name: string
  email: string
  password: string
  location?: string
  phone?: string
  headquartersLocation?: string
  otherBranches?: string[]
  workEnvironment?: string
  organizationType?: string
  industry?: string
  fieldOfStudy?: string
  websiteUrl?: string
  contactPersonName?: string
  contactPersonJobTitle?: string
  contactPersonEmail?: string
  contactPersonPhoneNumber?: string
  description?: string
  teamSize?: string
  socialMediaLinks?: string[]
  linkedinUrl?: string
  hiringRoles?: string[]
  internshipDuration?: string
  compensationRange?: string
}


