import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fileUploadService } from '@/services/fileUploadService';
import { useToast } from '@/components/ui/use-toast';

// Hook for uploading resume
export function useUploadResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (file: File) => fileUploadService.uploadResume(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been uploaded and updated in your profile.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload resume",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for uploading profile photo
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (file: File) => fileUploadService.uploadProfilePhoto(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile photo uploaded successfully",
        description: "Your profile photo has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload photo",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for uploading company logo
export function useUploadCompanyLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (file: File) => fileUploadService.uploadCompanyLogo(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Company logo uploaded successfully",
        description: "Your company logo has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload logo",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for uploading job photo
export function useUploadJobPhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (file: File) => fileUploadService.uploadJobPhoto(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['companyJobs'] });
      toast({
        title: "Job photo uploaded successfully",
        description: "The job photo has been uploaded and updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload job photo",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting files
export function useDeleteFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (fileUrl: string) => fileUploadService.deleteFile(fileUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "File deleted successfully",
        description: "The file has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete file",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
