"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CompanyIntern } from '@/services/companyInternService'

interface CompanyInternTerminateDialogProps {
  intern: CompanyIntern | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTerminate?: (internId: string) => void
}

export function CompanyInternTerminateDialog({
  intern,
  open,
  onOpenChange,
  onTerminate
}: CompanyInternTerminateDialogProps) {
  const [reason, setReason] = useState('')
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  React.useEffect(() => {
    if (intern) {
      setReason('')
      setEndDate(undefined)
      setFeedback('')
    }
  }, [intern])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intern || !reason || !endDate) return

    setIsSubmitting(true)
    try {
      // Here you would call the API to terminate the intern
      if (onTerminate) {
        onTerminate(intern._id)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to terminate intern:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!intern) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terminate Intern</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Intern</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{intern.intern.name}</div>
              <div className="text-sm text-gray-500">{intern.job.title}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Termination Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for termination..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Termination Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any additional feedback for the intern..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? 'Terminating...' : 'Terminate Intern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
