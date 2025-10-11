/**
 * Utility functions for handling image URLs
 */

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://intern-finder-backend-v2.onrender.com';

// Default fallback images
const DEFAULT_AVATAR = '/placeholder.svg?height=100&width=100&text=U';
const DEFAULT_LOGO = '/placeholder.svg?height=100&width=100&text=C';

/**
 * Converts a relative image path to a full URL
 * @param imagePath - The relative path from the backend (e.g., "/uploads/filename.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string | undefined => {
  // If no image path provided, return undefined (will use fallback in component)
  if (!imagePath || imagePath === 'no-logo.jpg' || imagePath === 'no-avatar.jpg') {
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Check if it's an old local upload path (these files no longer exist)
  // Pattern: logo-1234567890-123456789.png, photo-1234567890-123456789.jpg, etc.
  if (imagePath.match(/^(logo|photo|avatar|profile|resume)-.*\.(png|jpg|jpeg|gif)$/)) {
    return undefined; // Return undefined to use fallback image instead of 404
  }
  
  // If it starts with '/', it's a relative path from the backend
  if (imagePath.startsWith('/')) {
    return `${API_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend the uploads path
  return `${API_URL}/uploads/${imagePath}`;
};

/**
 * Gets the avatar URL for a user with fallback support
 * @param user - User object with avatar/logo properties
 * @returns Full URL to the avatar/logo or fallback
 */
export const getUserAvatarUrl = (user: { role: string; avatar?: string; logo?: string } | null | undefined): string => {
  if (!user) {
    return DEFAULT_AVATAR;
  }
  
  if (user.role === 'company') {
    return user.logo ? getImageUrl(user.logo) || DEFAULT_LOGO : DEFAULT_LOGO;
  } else {
    return user.avatar ? getImageUrl(user.avatar) || DEFAULT_AVATAR : DEFAULT_AVATAR;
  }
};

/**
 * Gets the company logo URL with fallback
 * @param logo - Logo path or undefined
 * @returns Full URL to the logo or fallback
 */
export const getCompanyLogoUrl = (logo: string | undefined | null): string => {
  return logo ? getImageUrl(logo) || DEFAULT_LOGO : DEFAULT_LOGO;
};

/**
 * Gets the user avatar URL with fallback
 * @param avatar - Avatar path or undefined
 * @returns Full URL to the avatar or fallback
 */
export const getUserProfileUrl = (avatar: string | undefined | null): string => {
  return avatar ? getImageUrl(avatar) || DEFAULT_AVATAR : DEFAULT_AVATAR;
};
