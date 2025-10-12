import { api } from './api';

export interface InternProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  education: Education[];
  skills: Skill[];
  experience: Experience[];
  resume?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  jobPreferences: {
    jobTypes: string[];
    locations: string[];
    remote: boolean;
    salaryExpectations?: {
      min: number;
      currency: string;
      period: string;
    };
  };
  workAuthorization?: string;
  availability?: string;
  preferredIndustries: string[];
  languages: Language[];
  profileCompletion: number;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  gpa?: number;
}

export interface Skill {
  _id?: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Experience {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  skills?: string[];
}

export interface Language {
  _id?: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface UpdateProfileRequest {
  name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  education?: Education[];
  skills?: Skill[];
  experience?: Experience[];
  resume?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  jobPreferences?: {
    jobTypes?: string[];
    locations?: string[];
    remote?: boolean;
    salaryExpectations?: {
      min: number;
      currency: string;
      period: string;
    };
  };
  workAuthorization?: string;
  availability?: string;
  preferredIndustries?: string[];
  languages?: Language[];
}

export interface ProfileResponse {
  success: boolean;
  data: InternProfile;
  message?: string;
}

export const internProfileService = {
  // Get current intern's profile
  async getMyProfile(): Promise<ProfileResponse> {
    const response = await api.get('/interns/me');
    return response.data;
  },

  // Get public intern profile by ID
  async getProfileById(id: string): Promise<ProfileResponse> {
    const response = await api.get(`/interns/${id}`);
    return response.data;
  },

  // Update current intern's profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await api.put('/interns/me', profileData);
    return response.data;
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/uploads/cloudinary/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload resume
  async uploadResume(file: File): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/uploads/cloudinary/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default internProfileService;
