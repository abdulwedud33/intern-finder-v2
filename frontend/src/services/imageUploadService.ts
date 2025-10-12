import { api } from './api';

export interface ImageUploadResponse {
  success: boolean;
  data: any;
  message?: string;
}

export const imageUploadService = {
  // Upload profile picture for intern
  async uploadProfilePicture(file: File): Promise<ImageUploadResponse> {
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
  async uploadCompanyLogo(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post('/uploads/cloudinary/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload resume for intern
  async uploadResume(file: File): Promise<ImageUploadResponse> {
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

export default imageUploadService;
