import { api } from './api';

export interface FileUploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    size: number;
    type: string;
  };
  message?: string;
}

export const fileUploadService = {
  // Upload resume for intern
  async uploadResume(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/uploads/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload profile photo for intern
  async uploadProfilePhoto(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/uploads/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload company logo
  async uploadCompanyLogo(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/uploads/company-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload job photo
  async uploadJobPhoto(file: File, jobId?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (jobId) {
      formData.append('jobId', jobId);
    }
    
    const response = await api.post('/uploads/job-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete uploaded file
  async deleteFile(fileUrl: string): Promise<FileUploadResponse> {
    const response = await api.delete('/uploads/delete', {
      data: { fileUrl }
    });
    return response.data;
  }
};
