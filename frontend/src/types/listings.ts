export type EmploymentType = "Full-Time" | "Part-Time" | "Remote"

export interface SalaryRange {
  min: number
  max: number
}

// Matches Swagger request body for POST /listings
export interface CreateListingRequest {
  title: string
  description: string
  location: string
  categories: string[]
  typesOfEmployment: EmploymentType[]
  salaryRange: SalaryRange
  keyResponsibilities: string[]
  status: "Live" | "Closed"
  dueDate?: string
  capacity?: number
  qualifications: string[]
  niceToHaves?: string[]
}


