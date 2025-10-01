import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { internProfileService, type InternProfile, type UpdateProfileRequest } from '@/services/internProfileService';
import { useToast } from '@/components/ui/use-toast';

// Hook for getting current intern's profile
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['internProfile', 'me'],
    queryFn: () => internProfileService.getMyProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for getting public intern profile by ID
export const useInternProfile = (id: string) => {
  return useQuery({
    queryKey: ['internProfile', id],
    queryFn: () => internProfileService.getProfileById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for updating profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (profileData: UpdateProfileRequest) => 
      internProfileService.updateProfile(profileData),
    onSuccess: (data) => {
      // Update the profile in cache
      queryClient.setQueryData(['internProfile', 'me'], data);
      
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['internProfile', 'me'] });
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
};

// Hook for uploading profile picture
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => internProfileService.uploadProfilePicture(file),
    onSuccess: (data) => {
      // Update the profile in cache
      queryClient.setQueryData(['internProfile', 'me'], data);
      
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['internProfile', 'me'] });
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload picture",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
};

// Hook for uploading resume
export const useUploadResume = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => internProfileService.uploadResume(file),
    onSuccess: (data) => {
      // Update the profile in cache
      queryClient.setQueryData(['internProfile', 'me'], data);
      
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['internProfile', 'me'] });
      
      toast({
        title: "Resume updated",
        description: "Your resume has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload resume",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
};
