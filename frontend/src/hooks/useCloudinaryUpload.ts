import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { cloudinaryService, CloudinaryUploadResponse } from '@/services/cloudinaryService';
import { toast } from 'sonner';

export interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export const useCloudinaryUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress({ isUploading: true, progress: 0, error: null });
      
      try {
        const response = await cloudinaryService.uploadAvatar(file);
        setUploadProgress({ isUploading: false, progress: 100, error: null });
        return response;
      } catch (error: any) {
        setUploadProgress({ isUploading: false, progress: 0, error: error.message });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Avatar uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to upload avatar', {
        description: error.message || 'Please try again'
      });
    }
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress({ isUploading: true, progress: 0, error: null });
      
      try {
        const response = await cloudinaryService.uploadLogo(file);
        setUploadProgress({ isUploading: false, progress: 100, error: null });
        return response;
      } catch (error: any) {
        setUploadProgress({ isUploading: false, progress: 0, error: error.message });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Logo uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to upload logo', {
        description: error.message || 'Please try again'
      });
    }
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress({ isUploading: true, progress: 0, error: null });
      
      try {
        const response = await cloudinaryService.uploadResume(file);
        setUploadProgress({ isUploading: false, progress: 100, error: null });
        return response;
      } catch (error: any) {
        setUploadProgress({ isUploading: false, progress: 0, error: error.message });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Resume uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to upload resume', {
        description: error.message || 'Please try again'
      });
    }
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (publicId: string) => {
      const response = await cloudinaryService.deleteFile(publicId);
      return response;
    },
    onSuccess: () => {
      toast.success('File deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete file', {
        description: error.message || 'Please try again'
      });
    }
  });

  return {
    uploadAvatar: uploadAvatarMutation,
    uploadLogo: uploadLogoMutation,
    uploadResume: uploadResumeMutation,
    deleteFile: deleteFileMutation,
    uploadProgress
  };
};

// Hook for direct uploads with progress tracking
export const useDirectCloudinaryUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null
  });

  const directUploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: any }) => {
      setUploadProgress({ isUploading: true, progress: 0, error: null });
      
      try {
        const response = await cloudinaryService.directUpload(file, {
          ...options,
          onProgress: (progress) => {
            setUploadProgress(prev => ({ ...prev, progress }));
          }
        });
        setUploadProgress({ isUploading: false, progress: 100, error: null });
        return response;
      } catch (error: any) {
        setUploadProgress({ isUploading: false, progress: 0, error: error.message });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('File uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to upload file', {
        description: error.message || 'Please try again'
      });
    }
  });

  return {
    directUpload: directUploadMutation,
    uploadProgress
  };
};
