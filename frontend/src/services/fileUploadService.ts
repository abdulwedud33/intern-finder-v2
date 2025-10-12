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
    formData.append('resume', file);
    
    const response = await api.post('/uploads/cloudinary/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload profile photo for intern
  async uploadProfilePhoto(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/uploads/cloudinary/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload company logo
  async uploadCompanyLogo(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post('/uploads/cloudinary/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload job photo
  async uploadJobPhoto(file: File, jobId?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
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
    // Extract public_id from Cloudinary URL for deletion
    const publicId = this.extractPublicId(fileUrl);
    const response = await api.delete('/uploads/cloudinary/delete', {
      data: { publicId }
    });
    return response.data;
  },

  // Extract public_id from Cloudinary URL
  extractPublicId(url: string): string {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/upload\/.*\/([^/]+)\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i);
    return match ? match[1] : url;
  }
};
