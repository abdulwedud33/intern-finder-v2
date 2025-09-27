import { 
  getCompanyProfile as apiGetCompanyProfile,
  updateCompanyProfile as apiUpdateCompanyProfile,
  addTeamMember as apiAddTeamMember,
  removeTeamMember as apiRemoveTeamMember,
  getPublicCompanyProfile
} from "@/lib/api";

// Generic API response type
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  website: string;
  logo?: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  foundedMonth?: string;
  headquarters: string;
  contactEmail: string;
  phoneNumber?: string;
  locations?: string[];
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

// Get company profile
export const getCompanyProfile = async (): Promise<ApiResponse<CompanyProfile>> => {
  try {
    const response = await apiGetCompanyProfile();
    if (!response.ok) {
      throw new Error(response.error || 'Failed to fetch company profile');
    }
    return response as ApiResponse<CompanyProfile>;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch company profile'
    };
  }
};

// Update company profile
export const updateCompanyProfile = async (profileData: Partial<CompanyProfile>): Promise<ApiResponse<CompanyProfile>> => {
  try {
    const response = await apiUpdateCompanyProfile(profileData);
    if (!response.ok) {
      throw new Error(response.error || 'Failed to update company profile');
    }
    return response as ApiResponse<CompanyProfile>;
  } catch (error) {
    console.error('Error updating company profile:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update company profile'
    };
  }
};

// Get team members
export const getTeamMembers = async (): Promise<ApiResponse<TeamMember[]>> => {
  try {
    // This is a placeholder. Replace with actual API call
    // const response = await apiGetTeamMembers();
    return {
      ok: true,
      data: [] // Replace with response.data
    };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch team members'
    };
  }
};

// Add team member
export const addTeamMember = async (email: string, role: string): Promise<ApiResponse<TeamMember>> => {
  try {
    const response = await apiAddTeamMember({ email, role });
    if (!response.ok) {
      throw new Error(response.error || 'Failed to add team member');
    }
    return {
      ok: true,
      data: response.data as TeamMember
    };
  } catch (error) {
    console.error('Error adding team member:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to add team member'
    };
  }
};

// Update team member role
export const updateTeamMemberRole = async (memberId: string, role: string): Promise<ApiResponse<TeamMember>> => {
  try {
    // This is a placeholder. Replace with actual API call
    // const response = await apiUpdateTeamMemberRole(memberId, role);
    const now = new Date().toISOString();
    return {
      ok: true,
      data: { 
        id: memberId, 
        name: '', 
        email: '', 
        role, 
        avatar: '',
        status: 'active',
        joinDate: now
      }
    };
  } catch (error) {
    console.error('Error updating team member role:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update team member role'
    };
  }
};

// Remove team member
export const removeTeamMember = async (memberId: string): Promise<ApiResponse<void>> => {
  try {
    await apiRemoveTeamMember(memberId);
    return { ok: true };
  } catch (error) {
    console.error('Error removing team member:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to remove team member'
    };
  }
};

// Upload company logo
export const uploadCompanyLogo = async (file: File): Promise<ApiResponse<{ logoUrl: string }>> => {
  try {
    // This is a placeholder. Replace with actual API call
    // const response = await apiUploadCompanyLogo(file);
    return {
      ok: true,
      data: { logoUrl: 'https://example.com/logo.png' } // Replace with actual URL from response
    };
  } catch (error) {
    console.error('Error uploading company logo:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to upload company logo'
    };
  }
};
