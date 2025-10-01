"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import { useMyInterviews, useCompanyInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview, useCancelInterview, useRescheduleInterview, useSubmitInterviewFeedback } from "@/hooks/useInterviews"
import { InterviewForm, InterviewCard } from "@/components/interviews/InterviewForm"
import { InterviewTable, InterviewStats } from "@/components/interviews/InterviewTable"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useCompanyApplications } from "@/hooks/useApplications"

// Calculate real statistics from interview data
const calculateInterviewStats = (interviews: any[]) => {
  const totalInterviews = interviews.length
  const upcomingInterviews = interviews.filter((interview: any) => 
    interview.status === 'scheduled' && new Date(interview.scheduledDate) > new Date()
  ).length
  const completedInterviews = interviews.filter((interview: any) => 
    interview.status === 'completed'
  ).length
  const cancelledInterviews = interviews.filter((interview: any) => 
    interview.status === 'cancelled'
  ).length
  
  const interviewsWithFeedback = interviews.filter((interview: any) => 
    interview.feedback && interview.feedback.rating
  )
  const averageRating = interviewsWithFeedback.length > 0 
    ? interviewsWithFeedback.reduce((sum: number, interview: any) => sum + interview.feedback.rating, 0) / interviewsWithFeedback.length
    : 0
  
  const successfulInterviews = interviews.filter((interview: any) => 
    interview.outcome === 'passed'
  ).length
  const successRate = completedInterviews > 0 ? Math.round((successfulInterviews / completedInterviews) * 100) : 0
  
  return {
    totalInterviews,
    upcomingInterviews,
    completedInterviews,
    cancelledInterviews,
    averageRating: Math.round(averageRating * 10) / 10,
    successRate
  }
}

export default function ClientInterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // Get company ID from user context (you'll need to implement this)
  const companyId = "company-id" // Replace with actual company ID from context
  
  const { data, isLoading, error } = useCompanyInterviews(companyId)
  const { data: applicationsData } = useCompanyApplications()
  const createInterviewMutation = useCreateInterview()
  const updateInterviewMutation = useUpdateInterview()
  const deleteInterviewMutation = useDeleteInterview()
  const cancelInterviewMutation = useCancelInterview()
  const rescheduleInterviewMutation = useRescheduleInterview()
  const submitFeedbackMutation = useSubmitInterviewFeedback()
  const { toast } = useToast()
  
  const interviews = useMemo(() => (data as any)?.data || [], [data])
  const applications = useMemo(() => (applicationsData as any)?.data || [], [applicationsData])
  const interviewStats = useMemo(() => calculateInterviewStats(interviews), [interviews])
  const [typeFilter, setTypeFilter] = useState("all")
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [scheduleData, setScheduleData] = useState({
    applicationId: "",
    scheduledDate: "",
    duration: 60,
    type: "video" as "phone" | "video" | "in-person",
    location: "",
    meetingLink: "",
    notes: ""
  })
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    reason: ""
  })
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comments: "",
    strengths: "",
    improvements: "",
    outcome: "pending" as "passed" | "failed" | "pending"
  })

  // Handler functions
  const handleCreateInterview = (data: any) => {
    createInterviewMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
        setScheduleData({
          applicationId: "",
          scheduledDate: "",
          duration: 60,
          type: "video",
          location: "",
          meetingLink: "",
          notes: ""
        })
      }
    })
  }

  const handleUpdateInterview = (data: any) => {
    if (editingInterview) {
      updateInterviewMutation.mutate({
        interviewId: editingInterview._id,
        updateData: data
      }, {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setEditingInterview(null)
        }
      })
    }
  }

  const handleDeleteInterview = (interviewId: string) => {
    deleteInterviewMutation.mutate(interviewId)
  }

  const handleCancelInterview = (interviewId: string) => {
    cancelInterviewMutation.mutate({ interviewId, reason: "Cancelled by company" })
  }

  const handleRescheduleInterview = (interview: any) => {
    setEditingInterview(interview)
    setIsEditDialogOpen(true)
  }

  // Filter interviews based on search and filters
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview: any) => {
      const matchesSearch = searchQuery
        ? interview.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interview.intern?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interview.interviewer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      
      const matchesStatus = statusFilter === "all" ? true : interview.status === statusFilter
      const matchesType = typeFilter === "all" ? true : interview.type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [interviews, searchQuery, statusFilter, typeFilter])

  // Group interviews by status
  const upcomingInterviews = filteredInterviews.filter((interview: any) => 
    interview.status === 'scheduled' && isAfter(new Date(interview.scheduledDate), new Date())
  )
  
  const pastInterviews = filteredInterviews.filter((interview: any) => 
    interview.status === 'completed' || 
    (interview.status === 'scheduled' && isBefore(new Date(interview.scheduledDate), new Date()))
  )

  const handleScheduleInterview = (application: any) => {
    setSelectedApplication(application)
    setScheduleData({
      applicationId: application._id,
      scheduledDate: "",
      duration: 60,
      type: "video",
      location: "",
      meetingLink: "",
      notes: ""
    })
    setIsScheduleOpen(true)
  }

  const handleScheduleSubmit = () => {
    if (!scheduleData.applicationId || !scheduleData.scheduledDate) return
    
    createInterviewMutation.mutate(scheduleData)
    setIsScheduleOpen(false)
    setSelectedApplication(null)
    setScheduleData({
      applicationId: "",
      scheduledDate: "",
      duration: 60,
      type: "video",
      location: "",
      meetingLink: "",
      notes: ""
    })
  }


  const handleRescheduleSubmit = () => {
    if (!selectedInterview || !rescheduleData.newDate) return
    
    rescheduleInterviewMutation.mutate({
      interviewId: selectedInterview._id,
      newDate: rescheduleData.newDate,
      reason: rescheduleData.reason
    })
    
    setIsRescheduleOpen(false)
    setSelectedInterview(null)
    setRescheduleData({ newDate: "", reason: "" })
  }

  const handleSubmitFeedback = (interview: any) => {
    setSelectedInterview(interview)
    setFeedbackData({
      rating: 0,
      comments: "",
      strengths: "",
      improvements: "",
      outcome: "pending"
    })
    setIsFeedbackOpen(true)
  }

  const handleFeedbackSubmit = () => {
    if (!selectedInterview || feedbackData.rating === 0) return
    
    submitFeedbackMutation.mutate({
      interviewId: selectedInterview._id,
      feedback: {
        rating: feedbackData.rating,
        comments: feedbackData.comments,
        strengths: feedbackData.strengths.split(',').map(s => s.trim()).filter(Boolean),
        improvements: feedbackData.improvements.split(',').map(s => s.trim()).filter(Boolean),
        outcome: feedbackData.outcome
      }
    })
    
    setIsFeedbackOpen(false)
    setSelectedInterview(null)
    setFeedbackData({
      rating: 0,
      comments: "",
      strengths: "",
      improvements: "",
      outcome: "pending"
    })
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      case 'rescheduled':
        return <Badge className="bg-yellow-100 text-yellow-700">Rescheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'in-person':
        return <MapPin className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return <LoadingCard />
  }

  if (error) {
    return <ErrorDisplay title="Error loading interviews" description="Failed to fetch interview data." />
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage interviews with candidates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <InterviewStats interviews={interviews} isLoading={isLoading} />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Upcoming Interviews ({upcomingInterviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview: any) => (
                <Card key={interview._id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {interview.intern?.name?.charAt(0) || 'I'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {interview.job?.title || 'Position'}
                              </h3>
                              <p className="text-gray-600 font-medium">
                                {interview.intern?.name || 'Candidate'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />
                                Interviewer: {interview.interviewer?.name || 'TBD'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(interview.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(interview.scheduledDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{format(new Date(interview.scheduledDate), 'h:mm a')} ({interview.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(interview.type)}
                              <span className="capitalize">{interview.type.replace('-', ' ')}</span>
                            </div>
                          </div>

                          {interview.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <MapPin className="h-4 w-4" />
                              <span>{interview.location}</span>
                            </div>
                          )}

                          {interview.meetingLink && (
                            <div className="mb-4">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Join Meeting
                              </Button>
                            </div>
                          )}

                          {interview.notes && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Notes:</strong> {interview.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleInterview(interview)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmitFeedback(interview)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Feedback
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInterview(interview._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Interview History ({pastInterviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastInterviews.map((interview: any) => (
                <Card key={interview._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gray-100 text-gray-700">
                            {interview.intern?.name?.charAt(0) || 'I'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {interview.job?.title || 'Position'}
                              </h3>
                              <p className="text-gray-600 font-medium">
                                {interview.intern?.name || 'Candidate'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />
                                Interviewer: {interview.interviewer?.name || 'TBD'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(interview.status)}
                              {interview.outcome && (
                                <Badge className={
                                  interview.outcome === 'passed' ? 'bg-green-100 text-green-700' :
                                  interview.outcome === 'failed' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }>
                                  {interview.outcome.charAt(0).toUpperCase() + interview.outcome.slice(1)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(interview.scheduledDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{format(new Date(interview.scheduledDate), 'h:mm a')} ({interview.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(interview.type)}
                              <span className="capitalize">{interview.type.replace('-', ' ')}</span>
                            </div>
                          </div>

                          {interview.feedback && (
                            <div className="p-4 bg-blue-50 rounded-lg mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Interview Feedback</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= interview.feedback.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {interview.feedback.rating}/5
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{interview.feedback.comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredInterviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? "No interviews match your current filters."
                : "You don't have any interviews scheduled yet. Schedule interviews with candidates to get started."
              }
            </p>
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setIsScheduleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Interview Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="application">Select Application</Label>
              <Select value={scheduleData.applicationId} onValueChange={(value) => setScheduleData(prev => ({ ...prev, applicationId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app: any) => (
                    <SelectItem key={app._id} value={app._id}>
                      {app.user?.name} - {app.job?.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduledDate">Date and Time</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduleData.scheduledDate}
                onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={scheduleData.duration}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={scheduleData.type} onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {scheduleData.type === 'in-person' && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={scheduleData.location}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                  placeholder="Office address or meeting room"
                />
              </div>
            )}
            {scheduleData.type === 'video' && (
              <div>
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  value={scheduleData.meetingLink}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  className="mt-1"
                  placeholder="Zoom, Teams, or Google Meet link"
                />
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                placeholder="Any special instructions or preparation notes"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleScheduleSubmit}
                disabled={!scheduleData.applicationId || !scheduleData.scheduledDate || createInterviewMutation.isPending}
              >
                {createInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDate">New Date and Time</Label>
              <Input
                id="newDate"
                type="datetime-local"
                value={rescheduleData.newDate}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rescheduling..."
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleSubmit}
                disabled={!rescheduleData.newDate || rescheduleInterviewMutation.isPending}
              >
                {rescheduleInterviewMutation.isPending ? "Rescheduling..." : "Reschedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Interview Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Overall Rating</Label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                    className={`p-1 ${
                      star <= feedbackData.rating
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {feedbackData.rating > 0 ? `${feedbackData.rating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="outcome">Interview Outcome</Label>
              <Select value={feedbackData.outcome} onValueChange={(value: any) => setFeedbackData(prev => ({ ...prev, outcome: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={feedbackData.comments}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                className="mt-1"
                placeholder="Detailed feedback about the candidate's performance..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="strengths">Strengths (comma-separated)</Label>
              <Input
                id="strengths"
                value={feedbackData.strengths}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, strengths: e.target.value }))}
                className="mt-1"
                placeholder="e.g., Strong technical skills, Good communication"
              />
            </div>
            <div>
              <Label htmlFor="improvements">Areas for Improvement (comma-separated)</Label>
              <Input
                id="improvements"
                value={feedbackData.improvements}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, improvements: e.target.value }))}
                className="mt-1"
                placeholder="e.g., More experience with React, Better problem-solving"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleFeedbackSubmit}
                disabled={feedbackData.rating === 0 || submitFeedbackMutation.isPending}
              >
                {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Interview Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <InterviewForm
            onSubmit={handleCreateInterview}
            onCancel={() => setIsCreateDialogOpen(false)}
            mode="create"
            isLoading={createInterviewMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Interview Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
          </DialogHeader>
          {editingInterview && (
            <InterviewForm
              interview={editingInterview}
              onSubmit={handleUpdateInterview}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingInterview(null)
              }}
              mode="edit"
              isLoading={updateInterviewMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
