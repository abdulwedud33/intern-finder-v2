import { api } from './api';

export interface CloudinaryUploadResponse {
  success: boolean;
  data: {
    url: string;
    public_id: string;
    size: number;
    type: string;
    user?: any;
  };
}

export interface CloudinaryDeleteResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface CloudinarySignatureResponse {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder?: string;
  };
}

class CloudinaryService {
  /**
   * Upload avatar for intern registration
   */
  async uploadAvatar(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/uploads/cloudinary/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload logo for company registration
   */
  async uploadLogo(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/uploads/cloudinary/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload resume for job application
   */
  async uploadResume(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/uploads/cloudinary/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<CloudinaryDeleteResponse> {
    const response = await api.delete('/uploads/cloudinary/delete', {
      data: { publicId }
    });

    return response.data;
  }

  /**
   * Get upload signature for direct frontend uploads
   */
  async getUploadSignature(folder?: string): Promise<CloudinarySignatureResponse> {
    const response = await api.post('/uploads/cloudinary/signature', {
      folder
    });

    return response.data;
  }

  /**
   * Direct upload to Cloudinary using frontend SDK
   * This method can be used for direct uploads without going through the backend
   */
  async directUpload(file: File, options: {
    folder?: string;
    publicId?: string;
    onProgress?: (progress: number) => void;
  } = {}): Promise<CloudinaryUploadResponse> {
    // Get upload signature from backend
    const signatureResponse = await this.getUploadSignature(options.folder);
    const { signature, timestamp, cloudName, apiKey } = signatureResponse.data;

    // Create form data for direct upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // You'll need to create this preset in Cloudinary
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress!(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            data: {
              url: response.secure_url,
              public_id: response.public_id,
              size: response.bytes,
              type: response.format
            }
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  }
}

export const cloudinaryService = new CloudinaryService();
