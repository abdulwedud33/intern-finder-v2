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
  RefreshCw
} from "lucide-react"
import { useMyInterviews, useCancelInterview, useRescheduleInterview } from "@/hooks/useInterviews"
import { InterviewCard } from "@/components/interviews/InterviewForm"
import { InterviewStats } from "@/components/interviews/InterviewTable"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

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

export default function InternInterviewsPage() {
  const { data, isLoading, error } = useMyInterviews()
  const cancelInterviewMutation = useCancelInterview()
  const rescheduleInterviewMutation = useRescheduleInterview()
  
  const interviews = useMemo(() => {
    const interviewsData = (data as any)?.data || []
    console.log('Intern dashboard - Raw interviews data:', interviewsData)
    if (interviewsData.length > 0) {
      console.log('Intern dashboard - First interview details:', {
        _id: interviewsData[0]._id,
        link: interviewsData[0].link,
        meetingLink: interviewsData[0].meetingLink,
        scheduledDate: interviewsData[0].scheduledDate,
        date: interviewsData[0].date
      })
    }
    return interviewsData
  }, [data])
  const interviewStats = useMemo(() => calculateInterviewStats(interviews), [interviews])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    reason: ""
  })

  // Filter interviews based on search and filters
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview: any) => {
      const matchesSearch = searchQuery
        ? interview.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interview.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleCancelInterview = (interviewId: string) => {
    if (confirm("Are you sure you want to cancel this interview?")) {
      cancelInterviewMutation.mutate({ interviewId })
    }
  }

  const handleRescheduleInterview = (interview: any) => {
    setSelectedInterview(interview)
    setRescheduleData({
      newDate: format(new Date(interview.scheduledDate), "yyyy-MM-dd'T'HH:mm"),
      reason: ""
    })
    setIsRescheduleOpen(true)
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
          <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
          <p className="text-gray-600 mt-1">Manage your scheduled interviews and view interview history.</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Interviews</p>
                <p className="text-3xl font-bold">{interviewStats.totalInterviews}</p>
              </div>
              <Calendar className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold">{interviewStats.upcomingInterviews}</p>
              </div>
              <Clock className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">{interviewStats.completedInterviews}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold">{interviewStats.successRate}%</p>
              </div>
              <Star className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                            {interview.company?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {interview.job?.title || 'Position'}
                              </h3>
                              <p className="text-gray-600 font-medium">
                                {interview.company?.name || 'Company'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />
                                {interview.interviewer?.name || 'Interviewer'}
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
                              <span>{format(new Date(interview.scheduledDate), 'h:mm a')} (Stored: {new Date(interview.scheduledDate).toISOString().substring(11, 16)} UTC) ({interview.duration} min)</span>
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
                              <div className="mb-2">
                                <span className="text-sm text-gray-600">Meeting Link:</span>
                                <a 
                                  href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:underline break-all"
                                >
                                  {interview.meetingLink}
                                </a>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => window.open(interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`, '_blank')}
                              >
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
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInterview(interview._id)}
                          className="text-red-600 hover:text-red-700"
                        >
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
                            {interview.company?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {interview.job?.title || 'Position'}
                              </h3>
                              <p className="text-gray-600 font-medium">
                                {interview.company?.name || 'Company'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />
                                {interview.interviewer?.name || 'Interviewer'}
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
                              <span>{format(new Date(interview.scheduledDate), 'h:mm a')} (Stored: {new Date(interview.scheduledDate).toISOString().substring(11, 16)} UTC) ({interview.duration} min)</span>
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
                : "You don't have any interviews scheduled yet. Apply to jobs to get interview opportunities."
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
              <Button asChild>
                <a href="/jobs">Browse Jobs</a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
