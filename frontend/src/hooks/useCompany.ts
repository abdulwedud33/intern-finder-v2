import { useState, useEffect } from 'react';
import { 
  CompanyProfile, 
  TeamMember, 
  getCompanyProfile, 
  updateCompanyProfile, 
  getTeamMembers, 
  addTeamMember, 
  updateTeamMemberRole, 
  removeTeamMember, 
  uploadCompanyLogo,
  ApiResponse
} from '@/services/companyService';
import { toast } from 'sonner';

export function useCompany() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load company profile
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response: ApiResponse<CompanyProfile> = await getCompanyProfile();
      if (response.ok && response.data) {
        setProfile(response.data);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to load company profile');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load team members
  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const response: ApiResponse<TeamMember[]> = await getTeamMembers();
      if (response.ok && response.data) {
        setTeam(response.data);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to load team members');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update company profile
  const updateProfile = async (profileData: Partial<CompanyProfile>) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<CompanyProfile> = await updateCompanyProfile(profileData);
      if (response.ok && response.data) {
        setProfile(prev => ({
          ...(prev || {}),
          ...response.data
        } as CompanyProfile));
        toast.success('Profile updated successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new team member
  const inviteTeamMember = async (email: string, role: string) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<TeamMember> = await addTeamMember(email, role);
      if (response.ok && response.data) {
        setTeam(prev => [...prev, response.data!]);
        toast.success('Team member invited successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to invite team member');
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update team member role
  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<TeamMember> = await updateTeamMemberRole(memberId, role);
      if (response.ok && response.data) {
        setTeam(prev => 
          prev.map(member => 
            member.id === memberId ? { ...member, role } : member
          )
        );
        toast.success('Team member updated successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update team member');
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a team member
  const deleteTeamMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<void> = await removeTeamMember(memberId);
      if (response.ok) {
        setTeam(prev => prev.filter(member => member.id !== memberId));
        toast.success('Team member removed successfully');
      } else {
        throw new Error(response.error || 'Failed to remove team member');
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload company logo
  const uploadLogo = async (file: File) => {
    try {
      setIsLoading(true);
      const response = await uploadCompanyLogo(file) as { ok: boolean; data?: { logoUrl: string }; error?: string };
      if (response.ok && response.data) {
        setProfile(prev => ({
          ...prev!,
          logo: response.data!.logoUrl
        }));
        toast.success('Logo uploaded successfully');
        return response.data.logoUrl;
      } else {
        throw new Error(response.error || 'Failed to upload logo');
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to upload logo');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    loadProfile();
    loadTeam();
  }, []);

  return {
    profile,
    team,
    isLoading,
    error,
    updateProfile,
    inviteTeamMember,
    updateMemberRole,
    deleteTeamMember,
    uploadLogo,
    refresh: () => {
      loadProfile();
      loadTeam();
    },
  };
}
