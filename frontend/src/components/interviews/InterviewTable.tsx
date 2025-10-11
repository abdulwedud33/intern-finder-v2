"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserAvatarUrl } from '@/utils/imageUtils'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Interview } from '@/services/interviewService'
import { format, formatDistanceToNow } from 'date-fns'

interface InterviewTableProps {
  interviews: Interview[]
  onEdit?: (interview: Interview) => void
  onDelete?: (interviewId: string) => void
  onCancel?: (interviewId: string) => void
  onReschedule?: (interview: Interview) => void
  canEdit?: boolean
  canDelete?: boolean
  canCancel?: boolean
  canReschedule?: boolean
  isLoading?: boolean
  showApplicant?: boolean
  showCompany?: boolean
}

export const InterviewTable: React.FC<InterviewTableProps> = ({
  interviews,
  onEdit,
  onDelete,
  onCancel,
  onReschedule,
  canEdit = false,
  canDelete = false,
  canCancel = false,
  canReschedule = false,
  isLoading = false,
  showApplicant = false,
  showCompany = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null)

  const handleDeleteClick = (interviewId: string) => {
    setInterviewToDelete(interviewId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (interviewToDelete && onDelete) {
      onDelete(interviewToDelete)
    }
    setDeleteDialogOpen(false)
    setInterviewToDelete(null)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'rescheduled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a')
  }

  const isUpcoming = (interview: Interview) => {
    return interview.status === 'scheduled' && new Date(interview.scheduledDate) > new Date()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
        <p className="text-gray-500">No interviews have been scheduled yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              {showApplicant && <TableHead>Applicant</TableHead>}
              {showCompany && <TableHead>Company</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Location/Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview._id} className={isUpcoming(interview) ? 'bg-blue-50/30' : ''}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(interview.type)}
                    <span className="capitalize">{interview.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{formatDate(interview.scheduledDate)}</div>
                    <div className="text-sm text-gray-500">{formatTime(interview.scheduledDate)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{interview.duration} min</span>
                  </div>
                </TableCell>
                {showApplicant && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getUserAvatarUrl({...interview.interviewer, role: 'company'})} />
                        <AvatarFallback>
                          {interview.interviewer?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{interview.interviewer?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{interview.interviewer?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                )}
                {showCompany && (
                  <TableCell>
                    <div className="font-medium">Company Name</div>
                    <div className="text-sm text-gray-500">Company Email</div>
                  </TableCell>
                )}
                <TableCell>
                  <Badge className={getStatusColor(interview.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(interview.status)}
                      <span className="capitalize">{interview.status}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  {interview.type === 'in-person' && interview.location ? (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{interview.location}</span>
                    </div>
                  ) : interview.type === 'video' && interview.meetingLink ? (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm underline flex items-center space-x-1"
                    >
                      <Video className="h-4 w-4" />
                      <span>Join Meeting</span>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(interview)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canReschedule && onReschedule && isUpcoming(interview) && (
                        <DropdownMenuItem onClick={() => onReschedule(interview)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </DropdownMenuItem>
                      )}
                      {canCancel && onCancel && isUpcoming(interview) && (
                        <DropdownMenuItem 
                          onClick={() => onCancel(interview._id)}
                          className="text-orange-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                      {canDelete && onDelete && (
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(interview._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Interview Statistics Component
interface InterviewStatsProps {
  interviews: Interview[]
  isLoading?: boolean
}

export const InterviewStats: React.FC<InterviewStatsProps> = ({
  interviews,
  isLoading = false
}) => {
  const stats = {
    total: interviews.length,
    upcoming: interviews.filter(interview => 
      interview.status === 'scheduled' && new Date(interview.scheduledDate) > new Date()
    ).length,
    completed: interviews.filter(interview => interview.status === 'completed').length,
    cancelled: interviews.filter(interview => interview.status === 'cancelled').length,
    thisWeek: interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return interviewDate >= now && interviewDate <= weekFromNow
    }).length
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total Interviews</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Upcoming</p>
            <p className="text-2xl font-bold text-green-900">{stats.upcoming}</p>
          </div>
          <Clock className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Completed</p>
            <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">This Week</p>
            <p className="text-2xl font-bold text-orange-900">{stats.thisWeek}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-orange-600" />
        </div>
      </div>
    </div>
  )
}
