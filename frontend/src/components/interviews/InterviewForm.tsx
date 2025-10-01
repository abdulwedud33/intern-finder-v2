"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, MapPin, Video, Phone, User } from 'lucide-react'
import { CreateInterviewRequest, UpdateInterviewRequest, Interview } from '@/services/interviewService'
import { format } from 'date-fns'

interface InterviewFormProps {
  interview?: Interview
  applicationId?: string
  onSubmit: (data: CreateInterviewRequest | UpdateInterviewRequest) => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export const InterviewForm: React.FC<InterviewFormProps> = ({
  interview,
  applicationId,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [formData, setFormData] = useState({
    applicationId: applicationId || interview?.applicationId || '',
    scheduledDate: interview?.scheduledDate ? format(new Date(interview.scheduledDate), "yyyy-MM-dd'T'HH:mm") : '',
    duration: interview?.duration || 60,
    type: interview?.type || 'video' as 'phone' | 'video' | 'in-person',
    location: interview?.location || '',
    meetingLink: interview?.meetingLink || '',
    notes: interview?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.applicationId) {
      newErrors.applicationId = 'Application ID is required'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required'
    } else {
      const scheduledDate = new Date(formData.scheduledDate)
      const now = new Date()
      if (scheduledDate <= now) {
        newErrors.scheduledDate = 'Scheduled date must be in the future'
      }
    }

    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes'
    }

    if (formData.type === 'in-person' && !formData.location) {
      newErrors.location = 'Location is required for in-person interviews'
    }

    if (formData.type === 'video' && !formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required for video interviews'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      duration: Number(formData.duration)
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === 'create' ? 'Schedule Interview' : 'Edit Interview'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Application ID (for create mode) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID *</Label>
              <Input
                id="applicationId"
                value={formData.applicationId}
                onChange={(e) => handleInputChange('applicationId', e.target.value)}
                placeholder="Enter application ID"
                disabled={isLoading}
                className={errors.applicationId ? 'border-red-500' : ''}
              />
              {errors.applicationId && (
                <p className="text-sm text-red-500">{errors.applicationId}</p>
              )}
            </div>
          )}

          {/* Scheduled Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date & Time *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  disabled={isLoading}
                  className={`pl-10 ${errors.scheduledDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.scheduledDate && (
                <p className="text-sm text-red-500">{errors.scheduledDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                  className={`pl-10 ${errors.duration ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Interview Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Interview Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Call
                  </div>
                </SelectItem>
                <SelectItem value="in-person">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    In-Person
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location (for in-person interviews) */}
          {formData.type === 'in-person' && (
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter interview location"
                  disabled={isLoading}
                  className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          )}

          {/* Meeting Link (for video interviews) */}
          {formData.type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link *</Label>
              <Input
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                placeholder="Enter meeting link (Zoom, Teams, etc.)"
                disabled={isLoading}
                className={errors.meetingLink ? 'border-red-500' : ''}
              />
              {errors.meetingLink && (
                <p className="text-sm text-red-500">{errors.meetingLink}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes or instructions..."
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Schedule Interview' : 'Update Interview'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Interview Card Component
interface InterviewCardProps {
  interview: Interview
  onEdit?: (interview: Interview) => void
  onDelete?: (interviewId: string) => void
  onCancel?: (interviewId: string) => void
  onReschedule?: (interview: Interview) => void
  canEdit?: boolean
  canDelete?: boolean
  canCancel?: boolean
  canReschedule?: boolean
  isLoading?: boolean
}

export const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  onEdit,
  onDelete,
  onCancel,
  onReschedule,
  canEdit = false,
  canDelete = false,
  canCancel = false,
  canReschedule = false,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'in-person':
        return <User className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const isUpcoming = interview.status === 'scheduled' && new Date(interview.scheduledDate) > new Date()

  return (
    <Card className={`w-full ${isUpcoming ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isUpcoming ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {getTypeIcon(interview.type)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {interview.type === 'in-person' ? 'In-Person Interview' : 
                 interview.type === 'video' ? 'Video Interview' : 'Phone Interview'}
              </h4>
              <p className="text-sm text-gray-500">
                {formatDate(interview.scheduledDate)} at {formatTime(interview.scheduledDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
              {interview.status}
            </span>
            {(canEdit || canDelete || canCancel || canReschedule) && (
              <div className="flex space-x-1">
                {canEdit && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(interview)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                )}
                {canReschedule && onReschedule && isUpcoming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReschedule(interview)}
                    disabled={isLoading}
                  >
                    Reschedule
                  </Button>
                )}
                {canCancel && onCancel && isUpcoming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancel(interview._id)}
                    disabled={isLoading}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Cancel
                  </Button>
                )}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(interview._id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{interview.duration} minutes</span>
            </div>
            {interview.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{interview.location}</span>
              </div>
            )}
          </div>

          {interview.meetingLink && (
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-blue-600" />
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Join Meeting
              </a>
            </div>
          )}

          {interview.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {interview.notes}
              </p>
            </div>
          )}

          {interview.feedback && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Feedback:</span> {interview.feedback.comments}
              </p>
              {interview.feedback.rating && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= interview.feedback!.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
