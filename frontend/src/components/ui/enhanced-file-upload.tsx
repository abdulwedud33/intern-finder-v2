"use client"

import { useState, useRef, useEffect } from "react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getFilePreviewProps, formatFileSize } from "@/lib/fileUtils"
import { useUploadResume, useUploadProfilePhoto, useUploadCompanyLogo, useUploadJobPhoto, useDeleteFile } from "@/hooks/useFileUpload"

interface EnhancedFileUploadProps {
  onFileUploaded?: (fileUrl: string, filename: string) => void
  onFileRemoved?: () => void
  currentFile?: string | null
  fileType?: 'resume' | 'profile-photo' | 'company-logo' | 'job-photo'
  jobId?: string // Required for job photo uploads
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
  showPreview?: boolean
  showDownload?: boolean
  showDelete?: boolean
}

export function EnhancedFileUpload({
  onFileUploaded,
  onFileRemoved,
  currentFile,
  fileType = 'profile-photo',
  jobId,
  accept,
  maxSize = 10,
  disabled = false,
  className,
  showPreview = true,
  showDownload = true,
  showDelete = true
}: EnhancedFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload hooks
  const uploadResume = useUploadResume()
  const uploadProfilePhoto = useUploadProfilePhoto()
  const uploadCompanyLogo = useUploadCompanyLogo()
  const uploadJobPhoto = useUploadJobPhoto()
  const deleteFile = useDeleteFile()

  // Get current file preview props
  const filePreview = getFilePreviewProps(currentFile)

  // Get upload mutation based on file type
  const getUploadMutation = () => {
    switch (fileType) {
      case 'resume':
        return uploadResume
      case 'profile-photo':
        return uploadProfilePhoto
      case 'company-logo':
        return uploadCompanyLogo
      case 'job-photo':
        return uploadJobPhoto
      default:
        return uploadProfilePhoto
    }
  }

  const uploadMutation = getUploadMutation()

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`)
        return
      }

      // Validate file type
      if (fileType === 'profile-photo' || fileType === 'company-logo' || fileType === 'job-photo') {
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file')
          return
        }
      }

      if (fileType === 'resume') {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
          setError('Please select a PDF or Word document')
          return
        }
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Upload file
      const result = await uploadMutation.mutateAsync(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Call success callback
      if (onFileUploaded && result.data) {
        onFileUploaded(result.data.url, result.data.filename)
      }

      // Reset after success
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)

    } catch (error: any) {
      setError(error.response?.data?.message || 'Upload failed')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    handleFileUpload(file)
  }

  // Handle file removal
  const handleFileRemove = async () => {
    if (!currentFile) return

    try {
      await deleteFile.mutateAsync(currentFile)
      if (onFileRemoved) {
        onFileRemoved()
      }
    } catch (error) {
      setError('Failed to remove file')
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const getFileIcon = () => {
    if (fileType === 'profile-photo' || fileType === 'company-logo' || fileType === 'job-photo') {
      return <Image className="h-8 w-8 text-blue-500" aria-label="Image icon" />
    }
    if (fileType === 'resume') {
      return <FileText className="h-8 w-8 text-green-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getAcceptedTypes = () => {
    if (fileType === 'profile-photo' || fileType === 'company-logo' || fileType === 'job-photo') {
      return 'image/*'
    }
    if (fileType === 'resume') {
      return '.pdf,.doc,.docx'
    }
    return accept || '*'
  }

  const getUploadText = () => {
    switch (fileType) {
      case 'resume':
        return 'Upload Resume'
      case 'profile-photo':
        return 'Upload Profile Photo'
      case 'company-logo':
        return 'Upload Company Logo'
      case 'job-photo':
        return 'Upload Job Photo'
      default:
        return 'Upload File'
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500 bg-red-50",
          isUploading && "border-blue-500 bg-blue-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <CardContent className="p-6">
          {currentFile && filePreview ? (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="flex items-start space-x-4">
                {filePreview.isImage ? (
                  <div className="flex-shrink-0">
                    <NextImage
                      src={filePreview.url}
                      alt={filePreview.filename}
                      width={64}
                      height={64}
                      className="h-16 w-16 object-cover rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {filePreview.isDocument ? (
                        <FileText className="h-8 w-8 text-green-500" />
                      ) : (
                        <File className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {filePreview.filename}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {filePreview.extension.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    File uploaded successfully
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-2">
                    {showPreview && filePreview.isImage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(filePreview.url, '_blank')
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    )}
                    
                    {showDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(filePreview.url, '_blank')
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFileRemove()
                        }}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteFile.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleteFile.isPending ? 'Removing...' : 'Remove'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                {getFileIcon()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {getUploadText()}
                </p>
                <p className="text-xs text-gray-500">
                  Drag and drop or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max size: {maxSize}MB
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={disabled || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && (
        <div className="mt-2 flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Upload completed successfully!</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
