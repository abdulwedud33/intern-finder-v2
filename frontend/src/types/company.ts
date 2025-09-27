export interface CompanyProfile {
  _id: string;
  name: string;
  website?: string;
  description?: string;
  logo?: string;
  founded?: number;
  employees?: string;
  industry?: string;
  primaryContact?: string;
  pressContact?: string;
  generalContact?: string;
  phone?: string;
  techStack?: string[];
  officeLocations?: Array<{
    address: string;
    city: string;
    country: string;
    isHeadquarters?: boolean;
  }>;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  teamMembers?: Array<{
    _id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}
