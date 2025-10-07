"use client"

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, FileImage, FileText } from 'lucide-react';
import Image from 'next/image';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  type: 'profile' | 'logo' | 'resume';
  currentImage?: string;
  onUpload?: (file: File) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

export function ImageUpload({
  type,
  currentImage,
  onUpload,
  className,
  disabled = false,
  showPreview = true,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const {
    previewUrl,
    selectedFile,
    handleFileSelect,
    clearPreview,
    uploadProfilePicture,
    uploadCompanyLogo,
    uploadResume,
    isUploading,
  } = useImageUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (onUpload) {
      onUpload(file);
    } else {
      // Auto-upload based on type
      switch (type) {
        case 'profile':
          uploadProfilePicture(file);
          break;
        case 'logo':
          uploadCompanyLogo(file);
          break;
        case 'resume':
          uploadResume(file);
          break;
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      if (onUpload) {
        onUpload(file);
      } else {
        handleFileSelect(file, type === 'resume' ? 'pdf' : 'image');
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getDisplayImage = () => {
    if (previewUrl) return previewUrl;
    if (currentImage) return currentImage;
    return null;
  };

  const getPlaceholderIcon = () => {
    switch (type) {
      case 'profile':
        return <Camera className="h-8 w-8 text-gray-400" />;
      case 'logo':
        return <FileImage className="h-8 w-8 text-gray-400" />;
      case 'resume':
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'profile':
        return 'Upload Profile Picture';
      case 'logo':
        return 'Upload Company Logo';
      case 'resume':
        return 'Upload Resume';
    }
  };

  const getAcceptedTypes = () => {
    switch (type) {
      case 'profile':
      case 'logo':
        return 'image/*';
      case 'resume':
        return '.pdf';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Card
        className={cn(
          "relative cursor-pointer transition-all duration-200 hover:shadow-md",
          isDragOver && "ring-2 ring-blue-500 ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Image Preview */}
            {showPreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {getDisplayImage() ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getDisplayImage()!}
                      alt={getPlaceholderText()}
                      fill
                      className="object-cover"
                    />
                    {previewUrl && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearPreview();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    {getPlaceholderIcon()}
                    <span className="text-sm text-gray-500 text-center">
                      {getPlaceholderText()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isUploading}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </span>
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                {type === 'resume' 
                  ? 'PDF files only, max 10MB'
                  : 'Images only, max 5MB'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

export default ImageUpload;
