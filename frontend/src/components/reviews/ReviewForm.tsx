"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, StarIcon } from 'lucide-react'
import { Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/reviewService'

interface ReviewFormProps {
  review?: Review
  targetId: string
  targetName: string
  targetType: 'Intern' | 'Company'
  jobId?: string
  jobTitle?: string
  onSubmit: (data: CreateReviewRequest | UpdateReviewRequest) => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  review,
  targetId,
  targetName,
  targetType,
  jobId,
  jobTitle,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [rating, setRating] = useState(review?.rating || 0)
  const [content, setContent] = useState(review?.content || '')
  const [feedback, setFeedback] = useState(review?.feedback || '')
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'create') {
      const createData: CreateReviewRequest = {
        target: targetId,
        targetModel: targetType,
        rating,
        content,
        feedback: feedback || undefined,
        job: jobId,
        direction: targetType === 'Company' ? 'intern_to_company' : 'company_to_intern'
      }
      onSubmit(createData)
    } else {
      const updateData: UpdateReviewRequest = {
        rating,
        content,
        feedback: feedback || undefined
      }
      onSubmit(updateData)
    }
  }

  const handleRatingClick = (newRating: number) => {
    setRating(newRating)
  }

  const handleRatingHover = (newRating: number) => {
    setHoveredRating(newRating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  const displayRating = hoveredRating || rating

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === 'create' ? 'Write a Review' : 'Edit Review'}
        </CardTitle>
        <div className="text-sm text-gray-600">
          {mode === 'create' ? 'Reviewing' : 'Editing review for'} {targetName}
          {jobTitle && (
            <span className="block text-xs text-gray-500">
              Job: {jobTitle}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Rating *</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="p-1 rounded transition-colors hover:bg-gray-100"
                  disabled={isLoading}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= displayRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {displayRating > 0 ? `${displayRating} star${displayRating !== 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3">
            <Label htmlFor="content" className="text-base font-medium">
              Review Content *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Share your experience working with ${targetName}...`}
              rows={4}
              required
              disabled={isLoading}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              {content.length}/500 characters
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-base font-medium">
              Additional Feedback (Optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any additional comments or suggestions..."
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              {feedback.length}/300 characters
            </div>
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
              disabled={isLoading || rating === 0 || !content.trim()}
            >
              {isLoading ? 'Submitting...' : mode === 'create' ? 'Submit Review' : 'Update Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Star Rating Display Component
interface StarRatingDisplayProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  className?: string
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating,
  size = 'md',
  showNumber = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : star - 0.5 <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Review Card Component
interface ReviewCardProps {
  review: Review
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  canEdit?: boolean
  canDelete?: boolean
  isLoading?: boolean
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{review.reviewer?.name || 'Unknown Reviewer'}</h4>
              <p className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StarRatingDisplay rating={review.rating} size="sm" showNumber />
            {(canEdit || canDelete) && (
              <div className="flex space-x-1">
                {canEdit && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(review._id)}
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
          <p className="text-gray-700 leading-relaxed">{review.content}</p>
          
          {review.feedback && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Additional Feedback:</span> {review.feedback}
              </p>
            </div>
          )}

          {review.job && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Job:</span> {review.job.title}
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full ${
              review.status === 'approved' ? 'bg-green-100 text-green-700' :
              review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {review.status}
            </span>
            <span>
              {review.direction === 'company_to_intern' ? 'Company Review' : 'Intern Review'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
