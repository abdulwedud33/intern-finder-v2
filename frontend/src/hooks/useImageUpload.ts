import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { imageUploadService } from '@/services/imageUploadService';
import { useToast } from '@/components/ui/use-toast';

export interface ImageUploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useImageUpload() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: imageUploadService.uploadProfilePicture,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });

  // Company logo upload mutation
  const uploadCompanyLogoMutation = useMutation({
    mutationFn: imageUploadService.uploadCompanyLogo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({
        title: "Success",
        description: "Company logo uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload company logo",
        variant: "destructive",
      });
    },
  });

  // Resume upload mutation
  const uploadResumeMutation = useMutation({
    mutationFn: imageUploadService.uploadResume,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload resume",
        variant: "destructive",
      });
    },
  });

  // Handle file selection with preview
  const handleFileSelect = useCallback((file: File, type: 'image' | 'pdf' = 'image') => {
    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return false;
    }

    if (type === 'pdf' && file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return false;
    }

    // Validate file size
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for PDFs
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return false;
    }

    setSelectedFile(file);

    // Create preview URL for images
    if (type === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    return true;
  }, [toast]);

  // Clear preview
  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [previewUrl]);

  // Upload profile picture
  const uploadProfilePicture = useCallback((file: File) => {
    if (!handleFileSelect(file, 'image')) return;
    uploadProfilePictureMutation.mutate(file);
  }, [handleFileSelect, uploadProfilePictureMutation]);

  // Upload company logo
  const uploadCompanyLogo = useCallback((file: File) => {
    if (!handleFileSelect(file, 'image')) return;
    uploadCompanyLogoMutation.mutate(file);
  }, [handleFileSelect, uploadCompanyLogoMutation]);

  // Upload resume
  const uploadResume = useCallback((file: File) => {
    if (!handleFileSelect(file, 'pdf')) return;
    uploadResumeMutation.mutate(file);
  }, [handleFileSelect, uploadResumeMutation]);

  return {
    // State
    previewUrl,
    selectedFile,
    
    // Actions
    handleFileSelect,
    clearPreview,
    uploadProfilePicture,
    uploadCompanyLogo,
    uploadResume,
    
    // Loading states
    isUploadingProfile: uploadProfilePictureMutation.isPending,
    isUploadingLogo: uploadCompanyLogoMutation.isPending,
    isUploadingResume: uploadResumeMutation.isPending,
    
    // Any upload in progress
    isUploading: uploadProfilePictureMutation.isPending || 
                uploadCompanyLogoMutation.isPending || 
                uploadResumeMutation.isPending,
  };
}

export default useImageUpload;
