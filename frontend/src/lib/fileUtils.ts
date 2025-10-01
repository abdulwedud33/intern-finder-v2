/**
 * File utility functions for handling uploads, previews, and URLs
 */

// Get the full URL for a file path
export function getFileUrl(filePath: string | null | undefined): string | null {
  if (!filePath) return null
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath
  }
  
  // If it starts with /uploads, it's a backend path
  if (filePath.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}${filePath}`
  }
  
  // If it's just a filename, construct the full path
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/uploads/${filePath}`
}

// Get file preview URL for images
export function getImagePreviewUrl(filePath: string | null | undefined): string | null {
  const url = getFileUrl(filePath)
  if (!url) return null
  
  // For images, we can use the URL directly
  return url
}

// Get file download URL
export function getFileDownloadUrl(filePath: string | null | undefined): string | null {
  return getFileUrl(filePath)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Check if file is an image
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const ext = getFileExtension(filename)
  return imageExtensions.includes(ext)
}

// Check if file is a document
export function isDocumentFile(filename: string): boolean {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt']
  const ext = getFileExtension(filename)
  return docExtensions.includes(ext)
}

// Generate file preview component props
export function getFilePreviewProps(filePath: string | null | undefined) {
  const url = getFileUrl(filePath)
  if (!url) return null
  
  const filename = filePath?.split('/').pop() || 'Unknown file'
  const isImage = isImageFile(filename)
  const isDocument = isDocumentFile(filename)
  
  return {
    url,
    filename,
    isImage,
    isDocument,
    extension: getFileExtension(filename)
  }
}
