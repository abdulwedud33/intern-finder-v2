# File Upload System Integration Guide

This guide shows how to fully integrate the file upload system with resume, profile photo, and company logo uploads working end-to-end.

## Backend Setup

The backend already supports file uploads via `/api/uploads/*` endpoints:

- `POST /api/uploads/resume` - Upload resume (interns only)
- `POST /api/uploads/profile-photo` - Upload profile photo (interns only)  
- `POST /api/uploads/company-logo` - Upload company logo (companies only)
- `POST /api/uploads/job-photo` - Upload job photo (companies only)
- `DELETE /api/uploads/delete` - Delete uploaded file

### File Storage

Files are stored in `./public/uploads/` directory with the following naming convention:
- Resumes: `resume_{userId}.{ext}`
- Profile photos: `profile_{userId}.{ext}`
- Company logos: `logo_{companyId}.{ext}`
- Job photos: `job_{jobId}.{ext}`

### File Access

Files are accessible via: `{API_URL}/uploads/{filename}`

## Frontend Integration

### 1. File Utility Functions

Created `frontend/src/lib/fileUtils.ts` with helper functions:

```typescript
import { getFileUrl, getImagePreviewUrl, formatFileSize } from '@/lib/fileUtils'

// Get full URL for a file
const fileUrl = getFileUrl('/uploads/resume_123.pdf')
// Returns: http://localhost:5000/api/v1/uploads/resume_123.pdf

// Get image preview URL
const imageUrl = getImagePreviewUrl('profile_456.jpg')
// Returns: http://localhost:5000/api/v1/uploads/profile_456.jpg

// Format file size
const size = formatFileSize(1024000)
// Returns: "1000 KB"
```

### 2. Enhanced File Upload Component

Created `frontend/src/components/ui/enhanced-file-upload.tsx` with features:

- **Drag & Drop Support**: Users can drag files directly onto the upload area
- **File Preview**: Shows image previews and file icons
- **Progress Tracking**: Visual upload progress bar
- **File Validation**: Type and size validation
- **Download/Delete**: Built-in file management actions
- **Auto Upload**: Automatically uploads files when selected

#### Usage Examples:

```tsx
// Profile Photo Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Profile photo updated!")
  }}
  currentFile={user.photo}
  fileType="profile-photo"
  maxSize={5}
  showPreview={true}
  showDownload={true}
  showDelete={true}
/>

// Resume Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Resume updated!")
  }}
  currentFile={user.resume}
  fileType="resume"
  maxSize={10}
  showPreview={false}
  showDownload={true}
  showDelete={true}
/>

// Company Logo Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Company logo updated!")
  }}
  currentFile={company.logo}
  fileType="company-logo"
  maxSize={5}
  showPreview={true}
  showDownload={true}
  showDelete={true}
/>

// Job Photo Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Job photo uploaded!")
  }}
  currentFile={job.photo}
  fileType="job-photo"
  jobId={job.id}
  maxSize={5}
  showPreview={true}
  showDownload={true}
  showDelete={true}
/>
```

### 3. File Upload Hooks

Created `frontend/src/hooks/useFileUpload.ts` with React Query mutations:

```typescript
import { 
  useUploadResume, 
  useUploadProfilePhoto, 
  useUploadCompanyLogo, 
  useUploadJobPhoto,
  useDeleteFile 
} from '@/hooks/useFileUpload'

// Upload resume
const uploadResume = useUploadResume()
uploadResume.mutate(file)

// Upload profile photo
const uploadPhoto = useUploadProfilePhoto()
uploadPhoto.mutate(file)

// Upload company logo
const uploadLogo = useUploadCompanyLogo()
uploadLogo.mutate(file)

// Upload job photo
const uploadJobPhoto = useUploadJobPhoto()
uploadJobPhoto.mutate(file, { jobId: 'job123' })

// Delete file
const deleteFile = useDeleteFile()
deleteFile.mutate(fileUrl)
```

### 4. File Upload Service

Created `frontend/src/services/fileUploadService.ts` with API calls:

```typescript
import { fileUploadService } from '@/services/fileUploadService'

// Upload resume
const result = await fileUploadService.uploadResume(file)

// Upload profile photo
const result = await fileUploadService.uploadProfilePhoto(file)

// Upload company logo
const result = await fileUploadService.uploadCompanyLogo(file)

// Upload job photo
const result = await fileUploadService.uploadJobPhoto(file, jobId)

// Delete file
const result = await fileUploadService.deleteFile(fileUrl)
```

## Integration Examples

### 1. Intern Profile Page

```tsx
// Profile Photo Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Profile photo updated successfully!")
  }}
  currentFile={profile.photo}
  fileType="profile-photo"
  maxSize={5}
  showPreview={true}
  showDownload={true}
  showDelete={true}
/>

// Resume Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Resume updated successfully!")
  }}
  currentFile={profile.resume}
  fileType="resume"
  maxSize={10}
  showPreview={false}
  showDownload={true}
  showDelete={true}
/>
```

### 2. Company Profile Page

```tsx
// Company Logo Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast({
      title: "Company logo updated successfully!",
      description: "Your company logo has been updated."
    })
  }}
  currentFile={company.logo}
  fileType="company-logo"
  maxSize={5}
  showPreview={true}
  showDownload={true}
  showDelete={true}
/>
```

### 3. Job Creation Page

```tsx
// Job Photo Upload
<EnhancedFileUpload
  onFileUploaded={(fileUrl, filename) => {
    toast.success("Job photo selected! It will be uploaded when you create the job.")
  }}
  currentFile={formData.photoFile ? URL.createObjectURL(formData.photoFile) : null}
  fileType="job-photo"
  maxSize={5}
  showPreview={true}
  showDownload={false}
  showDelete={true}
/>
```

## File Display Components

### 1. Image Display with Fallback

```tsx
import { getFileUrl } from '@/lib/fileUtils'

function ProfileImage({ photo, name, className }) {
  const imageUrl = getFileUrl(photo)
  
  return (
    <img
      src={imageUrl || '/placeholder-user.jpg'}
      alt={name}
      className={className}
      onError={(e) => {
        e.target.src = '/placeholder-user.jpg'
      }}
    />
  )
}
```

### 2. File Download Link

```tsx
import { getFileDownloadUrl } from '@/lib/fileUtils'

function ResumeDownload({ resume, filename }) {
  const downloadUrl = getFileDownloadUrl(resume)
  
  if (!downloadUrl) return null
  
  return (
    <a
      href={downloadUrl}
      download={filename}
      className="text-blue-600 hover:text-blue-700"
    >
      <Download className="h-4 w-4 mr-2" />
      Download Resume
    </a>
  )
}
```

### 3. File Preview Modal

```tsx
import { getImagePreviewUrl } from '@/lib/fileUtils'

function FilePreview({ file, isOpen, onClose }) {
  const previewUrl = getImagePreviewUrl(file)
  
  if (!previewUrl) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <img
          src={previewUrl}
          alt="File preview"
          className="max-w-full max-h-[80vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
```

## Environment Variables

Make sure these environment variables are set:

```env
# Backend
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=10000000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## File Validation

The system validates:

- **File Types**:
  - Images: JPG, PNG, GIF, WebP, SVG
  - Documents: PDF, DOC, DOCX
- **File Sizes**:
  - Images: 5MB max
  - Documents: 10MB max
- **User Permissions**:
  - Interns can upload resumes and profile photos
  - Companies can upload logos and job photos

## Error Handling

The system handles:

- File size validation
- File type validation
- Network errors
- Server errors
- User permission errors

All errors are displayed via toast notifications with helpful messages.

## Security Features

- File type validation on both frontend and backend
- File size limits enforced
- User authentication required for all uploads
- Role-based access control
- Secure file naming to prevent conflicts
- File deletion capability

## Testing the Integration

1. **Upload a profile photo**:
   - Go to intern profile page
   - Click "Update Profile Photo"
   - Drag and drop an image or click to select
   - Verify upload progress and success message

2. **Upload a resume**:
   - Go to intern profile page
   - Scroll to "Quick Actions" section
   - Upload a PDF or Word document
   - Verify file appears with download option

3. **Upload a company logo**:
   - Go to company profile page
   - Click "Update Company Logo"
   - Upload an image
   - Verify logo appears in profile

4. **Upload a job photo**:
   - Go to job creation page
   - Upload a job photo
   - Verify preview and file selection

## Troubleshooting

### Common Issues:

1. **Files not uploading**:
   - Check file size limits
   - Verify file type is supported
   - Check network connection
   - Verify user authentication

2. **Files not displaying**:
   - Check API URL configuration
   - Verify file exists on server
   - Check CORS settings

3. **Permission errors**:
   - Verify user role matches upload type
   - Check authentication status
   - Verify API endpoints are correct

### Debug Steps:

1. Check browser network tab for API calls
2. Verify file upload service responses
3. Check backend logs for errors
4. Test with different file types and sizes
5. Verify environment variables are set correctly

This integration provides a complete file upload system with drag & drop, previews, progress tracking, and proper error handling.
