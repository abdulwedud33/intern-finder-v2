"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Star, StarHalf } from 'lucide-react'
import { CompanyIntern } from '@/services/companyInternService'
import { useInternPerformance, useAddPerformanceReview } from '@/hooks/useCompanyInterns'

interface CompanyInternPerformanceDialogProps {
  intern: CompanyIntern | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPerformanceReview?: (internId: string) => void
}

export function CompanyInternPerformanceDialog({
  intern,
  open,
  onOpenChange,
  onPerformanceReview
}: CompanyInternPerformanceDialogProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: performanceData, isLoading: isLoadingPerformance } = useInternPerformance(intern?._id || '')
  const addPerformanceReview = useAddPerformanceReview()

  React.useEffect(() => {
    if (intern) {
      setRating(0)
      setFeedback('')
      setStrengths('')
      setImprovements('')
    }
  }, [intern])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern || rating === 0) return

    setIsSubmitting(true)
    try {
      await addPerformanceReview.mutateAsync({
        internId: intern._id,
        data: {
          rating,
          feedback,
          strengths: strengths.split(',').map(s => s.trim()).filter(s => s),
          improvements: improvements.split(',').map(s => s.trim()).filter(s => s)
        }
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add performance review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={`h-8 w-8 ${
              star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
            disabled={!onRatingChange}
          >
            <Star className="h-full w-full" fill={star <= currentRating ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating} out of 5` : 'Select rating'}
        </span>
      </div>
    )
  }

  if (!intern) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Performance Review - {intern.intern.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Intern Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-medium">{intern.intern.name}</h3>
                <p className="text-sm text-gray-500">{intern.job.title} - {intern.job.department}</p>
                <p className="text-sm text-gray-500">Started: {new Date(intern.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Current Performance */}
          {intern.performance && (
            <div className="space-y-2">
              <Label>Current Performance</Label>
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex items-center space-x-2">
                  {renderStars(intern.performance.rating)}
                  <Badge variant="outline">Last reviewed: {new Date(intern.performance.lastReview).toLocaleDateString()}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{intern.performance.feedback}</p>
              </div>
            </div>
          )}

          {/* Performance History */}
          {isLoadingPerformance ? (
            <div className="space-y-2">
              <Label>Performance History</Label>
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : performanceData?.data && performanceData.data.length > 0 ? (
            <div className="space-y-2">
              <Label>Performance History</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {performanceData.data.map((review, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{review.feedback}</p>
                    <p className="text-xs text-gray-500">Reviewed by: {review.reviewer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* New Performance Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Overall Rating *</Label>
              {renderStars(rating, setRating)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback *</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback about the intern's performance..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths">Strengths (comma-separated)</Label>
              <Input
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g., Communication, Problem-solving, Teamwork"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements">Areas for Improvement (comma-separated)</Label>
              <Input
                id="improvements"
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="e.g., Time management, Technical skills, Leadership"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? 'Adding Review...' : 'Add Performance Review'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
