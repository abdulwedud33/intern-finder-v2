/**
 * Utility functions for handling image URLs
 */

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

/**
 * Converts a relative image path to a full URL
 * @param imagePath - The relative path from the backend (e.g., "/uploads/filename.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string | undefined => {
  console.log('getImageUrl: Input imagePath:', imagePath);
  console.log('getImageUrl: API_URL:', API_URL);
  
  if (!imagePath) {
    console.log('getImageUrl: No imagePath provided');
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('getImageUrl: Already full URL:', imagePath);
    return imagePath;
  }
  
  // If it starts with '/', it's a relative path from the backend
  if (imagePath.startsWith('/')) {
    const fullUrl = `${API_URL}${imagePath}`;
    console.log('getImageUrl: Constructed full URL from relative path:', fullUrl);
    return fullUrl;
  }
  
  // Otherwise, assume it's a relative path and prepend the uploads path
  const fullUrl = `${API_URL}/uploads/${imagePath}`;
  console.log('getImageUrl: Constructed full URL from filename:', fullUrl);
  return fullUrl;
};

/**
 * Gets the avatar URL for a user
 * @param user - User object with avatar/logo properties
 * @returns Full URL to the avatar/logo
 */
export const getUserAvatarUrl = (user: { role: string; avatar?: string; logo?: string } | null | undefined): string | undefined => {
  if (!user) {
    console.log('getUserAvatarUrl: No user provided');
    return undefined;
  }
  
  console.log('getUserAvatarUrl: Full user object:', user);
  console.log('getUserAvatarUrl: User data:', { role: user.role, avatar: user.avatar, logo: user.logo });
  
  if (user.role === 'company') {
    const logoUrl = getImageUrl(user.logo);
    console.log('getUserAvatarUrl: Company logo URL:', logoUrl);
    return logoUrl;
  } else {
    const avatarUrl = getImageUrl(user.avatar);
    console.log('getUserAvatarUrl: Intern avatar URL:', avatarUrl);
    return avatarUrl;
  }
};
