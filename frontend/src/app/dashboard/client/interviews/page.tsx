"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { useCompanyInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview } from "@/hooks/useInterviews"
import { useCompanyApplications } from "@/hooks/useApplications"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { Interview, CreateInterviewRequest } from "@/services/interviewService"
import { useAuth } from "@/contexts/AuthContext"

type InterviewType = 'phone' | 'video' | 'onsite' | 'other'

interface CreateInterviewData {
  applicationId: string
  scheduledDate: string
  duration: number
  type: InterviewType
  location?: string
  link?: string
  note?: string
}

export default function ClientInterviewsPage() {
  const queryClient = useQueryClient()
  
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [newInterviewData, setNewInterviewData] = useState<CreateInterviewData>({
    applicationId: "",
    scheduledDate: "",
    duration: 60,
    type: "video",
    location: "",
    link: "",
    note: ""
  })

  // Get current user
  const { user } = useAuth()
  
  // Fetch data
  const { data: interviewsResponse, isLoading: interviewsLoading, error: interviewsError } = useCompanyInterviews(user?.id || '')
  const { data: applicationsResponse, isLoading: applicationsLoading } = useCompanyApplications()

  // Transform data
  const interviews = useMemo(() => {
    const interviewsData = interviewsResponse?.data || []
    console.log('Raw interviews data:', interviewsData)
    if (interviewsData.length > 0) {
      console.log('First interview structure:', {
        _id: interviewsData[0]._id,
        job: interviewsData[0].job,
        jobId: interviewsData[0].jobId,
        internId: interviewsData[0].internId,
        status: interviewsData[0].status
      })
    }
    return Array.isArray(interviewsData) ? interviewsData : []
  }, [interviewsResponse])

  const applications = useMemo(() => {
    const apps = applicationsResponse?.data || []
    console.log('Raw applications data:', apps)
    console.log('Applications count:', apps.length)
    return apps
  }, [applicationsResponse])

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview: any) => {
      const matchesSearch = 
        interview.internId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (interview.job?.title || interview.jobId?.title)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.type?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTab = (() => {
        switch (activeTab) {
          case "scheduled": return interview.status === "scheduled"
          case "completed": return interview.status === "completed"
          case "cancelled": return interview.status === "cancelled"
          default: return true
        }
      })()
      
      return matchesSearch && matchesTab
    })
  }, [interviews, searchTerm, activeTab])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalInterviews = interviews.length
    const scheduledInterviews = interviews.filter((i: any) => i.status === 'scheduled').length
    const completedInterviews = interviews.filter((i: any) => i.status === 'completed').length
    const cancelledInterviews = interviews.filter((i: any) => i.status === 'cancelled').length
    
    return {
      total: totalInterviews,
      scheduled: scheduledInterviews,
      completed: completedInterviews,
      cancelled: cancelledInterviews
    }
  }, [interviews])

  // Mutations
  const createInterviewMutation = useCreateInterview()
  const updateInterviewMutation = useUpdateInterview()
  const deleteInterviewMutation = useDeleteInterview()
  
  console.log('Mutation states:', {
    isPending: createInterviewMutation.isPending,
    isError: createInterviewMutation.isError,
    isSuccess: createInterviewMutation.isSuccess,
    error: createInterviewMutation.error
  })

  // Handlers
  const handleCreateInterview = () => {
    console.log('=== BUTTON CLICKED ===')
    console.log('handleCreateInterview called with data:', newInterviewData)
    
    if (!newInterviewData.applicationId) {
      console.log('Validation failed: No applicationId')
      toast.error("Please select an application")
      return
    }
    if (!newInterviewData.scheduledDate) {
      console.log('Validation failed: No scheduledDate')
      toast.error("Please select a date and time")
      return
    }

    console.log('Calling createInterviewMutation.mutate with:', newInterviewData)
    createInterviewMutation.mutate(newInterviewData, {
      onSuccess: (data) => {
        console.log('Interview created successfully:', data)
        toast.success("Interview scheduled successfully!")
        setIsCreateDialogOpen(false)
        setNewInterviewData({
          applicationId: "",
          scheduledDate: "",
          duration: 60,
          type: "video",
          location: "",
          link: "",
          note: ""
        })
      },
      onError: (error: any) => {
        console.log('Interview creation failed:', error)
        toast.error(error?.response?.data?.error || "Failed to schedule interview")
      }
    })
  }

  const handleUpdateInterview = (interviewId: string, updateData: Partial<CreateInterviewData>) => {
    updateInterviewMutation.mutate(
      { interviewId, data: updateData },
      {
        onSuccess: () => {
          toast.success("Interview updated successfully!")
          setEditingInterview(null)
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to update interview")
        }
    }
    )
  }

  const handleDeleteInterview = (interviewId: string) => {
    deleteInterviewMutation.mutate(interviewId, {
      onSuccess: () => {
        toast.success("Interview cancelled successfully!")
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error || "Failed to cancel interview")
      }
    })
  }

  const handleCancelInterview = (interviewId: string) => {
    updateInterviewMutation.mutate(
      { interviewId, data: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast.success("Interview cancelled successfully!")
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to cancel interview")
        }
      }
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: InterviewType) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'onsite': return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: InterviewType) => {
    switch (type) {
      case 'phone': return 'Phone'
      case 'video': return 'Video'
      case 'onsite': return 'On-site'
      default: return 'Other'
    }
  }

  if (interviewsLoading) {
    return <LoadingCard />
  }

  if (interviewsError) {
    return <ErrorDisplay error={interviewsError} title="Failed to load interviews" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Interview Management</h1>
          <p className="text-gray-600 mt-2">Schedule and manage interviews with candidates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Application Selection */}
              <div className="space-y-2">
                <Label htmlFor="application">Select Application</Label>
                <Select
                  value={newInterviewData.applicationId}
                  onValueChange={(value) => setNewInterviewData(prev => ({ ...prev, applicationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.length === 0 ? (
                      <SelectItem value="" disabled>
                        No applications found
                      </SelectItem>
                    ) : (
                      applications.map((app: any) => (
                        <SelectItem key={app._id} value={app._id}>
                          {app.internId?.name} - {app.jobId?.title} ({app.status})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
      </div>

              {/* Date and Time */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date & Time</Label>
            <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newInterviewData.scheduledDate}
                  onChange={(e) => setNewInterviewData(prev => ({ ...prev, scheduledDate: e.target.value }))}
            />
          </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={newInterviewData.duration.toString()}
                  onValueChange={(value) => setNewInterviewData(prev => ({ ...prev, duration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
            </SelectTrigger>
            <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Interview Type</Label>
                <Select
                  value={newInterviewData.type}
                  onValueChange={(value: InterviewType) => setNewInterviewData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

              {/* Location/Link */}
              {newInterviewData.type === 'onsite' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Office address or meeting location"
                    value={newInterviewData.location || ''}
                    onChange={(e) => setNewInterviewData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              )}

              {newInterviewData.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="link">Meeting Link</Label>
                  <Input
                    id="link"
                    placeholder="Zoom, Teams, or other video call link"
                    value={newInterviewData.link || ''}
                    onChange={(e) => setNewInterviewData(prev => ({ ...prev, link: e.target.value }))}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  placeholder="Additional notes or instructions for the candidate"
                  value={newInterviewData.note || ''}
                  onChange={(e) => setNewInterviewData(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Button onClick triggered')
                    console.log('createInterviewMutation.isPending:', createInterviewMutation.isPending)
                    handleCreateInterview()
                  }}
                  disabled={createInterviewMutation.isPending}
                >
                  {createInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
        <Card>
          <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Interviews</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search interviews..." 
                  className="pl-10 w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          </CardHeader>
          <CardContent>
          {/* Status Tabs */}
          <div className="flex items-center space-x-6 border-b mb-6">
            <button 
              onClick={() => setActiveTab("all")}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === "all" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All ({stats.total})
            </button>
            <button 
              onClick={() => setActiveTab("scheduled")}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === "scheduled" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Scheduled ({stats.scheduled})
            </button>
            <button 
              onClick={() => setActiveTab("completed")}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === "completed" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button 
              onClick={() => setActiveTab("cancelled")}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === "cancelled" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Cancelled ({stats.cancelled})
            </button>
          </div>

          {/* Interviews List */}
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No interviews found</p>
              <p className="text-sm">Start scheduling interviews to see them here.</p>
              <Button variant="secondary" className="mt-4 bg-gray-700 hover:bg-gray-600 text-white" onClick={() => setIsCreateDialogOpen(true)}>Schedule Interview</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview: any) => (
                <Card key={interview._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={interview.internId?.avatar} alt={interview.internId?.name} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {interview.internId?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{interview.internId?.name}</h3>
                            <Badge className={getStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{interview.job?.title || interview.jobId?.title}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(interview.scheduledDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(interview.scheduledDate), 'h:mm a')}
                            </div>
                            <div className="flex items-center gap-1">
                              {getTypeIcon(interview.type)}
                              {getTypeLabel(interview.type)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {interview.duration} min
                            </div>
                          </div>
                          {interview.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4" />
                              {interview.location}
                            </div>
                          )}
                          {interview.link && (
                            <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                              <Video className="h-4 w-4" />
                              <a href={interview.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Join Meeting
                              </a>
                            </div>
                          )}
                          {interview.note && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{interview.note}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.status === 'scheduled' && (
                          <>
                        <Button
                          variant="outline"
                          size="sm"
                              onClick={() => setEditingInterview(interview)}
                        >
                              <Edit className="h-4 w-4" />
                        </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-4 w-4" />
                        </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Interview</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this interview? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
                                  <AlertDialogAction
                          onClick={() => handleCancelInterview(interview._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Cancel Interview
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

      {/* Edit Interview Dialog */}
      {editingInterview && (
        <Dialog open={!!editingInterview} onOpenChange={() => setEditingInterview(null)}>
          <DialogContent className="max-w-2xl">
          <DialogHeader>
              <DialogTitle>Edit Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
              {/* Date and Time */}
              <div className="space-y-2">
                <Label htmlFor="edit-scheduledDate">Date & Time</Label>
                <Input
                  id="edit-scheduledDate"
                  type="datetime-local"
                  value={editingInterview.scheduledDate ? format(new Date(editingInterview.scheduledDate), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setEditingInterview(prev => prev ? { ...prev, scheduledDate: e.target.value } : null)}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Select
                  value={editingInterview.duration.toString()}
                  onValueChange={(value) => setEditingInterview(prev => prev ? { ...prev, duration: parseInt(value) } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <Label htmlFor="edit-type">Interview Type</Label>
                <Select
                  value={editingInterview.type}
                  onValueChange={(value: InterviewType) => setEditingInterview(prev => prev ? { ...prev, type: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location/Link */}
              {editingInterview.type === 'onsite' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                <Input
                    id="edit-location"
                    placeholder="Office address or meeting location"
                    value={editingInterview.location || ''}
                    onChange={(e) => setEditingInterview(prev => prev ? { ...prev, location: e.target.value } : null)}
                />
              </div>
            )}

              {editingInterview.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-link">Meeting Link</Label>
                <Input
                    id="edit-link"
                    placeholder="Zoom, Teams, or other video call link"
                    value={editingInterview.link || ''}
                    onChange={(e) => setEditingInterview(prev => prev ? { ...prev, link: e.target.value } : null)}
                />
              </div>
            )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="edit-note">Notes</Label>
              <Textarea
                  id="edit-note"
                  placeholder="Additional notes or instructions for the candidate"
                  value={editingInterview.note || ''}
                  onChange={(e) => setEditingInterview(prev => prev ? { ...prev, note: e.target.value } : null)}
                rows={3}
              />
            </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingInterview(null)}>
                Cancel
              </Button>
              <Button
                  onClick={() => {
                    if (editingInterview) {
                      const updateData = {
                        scheduledDate: editingInterview.scheduledDate,
                        duration: editingInterview.duration,
                        type: editingInterview.type,
                        location: editingInterview.location,
                        link: editingInterview.link,
                        note: editingInterview.note
                      }
                      handleUpdateInterview(editingInterview._id, updateData)
                    }
                  }}
                  disabled={updateInterviewMutation.isPending}
                >
                  {updateInterviewMutation.isPending ? "Updating..." : "Update Interview"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}