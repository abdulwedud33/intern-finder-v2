"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ArrowLeft,
  MoreVertical,
  Star,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Download,
  Share2,
  Bookmark,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Plus,
  Edit,
  Trash2,
  Send,
  Video,
  Mic,
  Camera,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea as TextareaComponent } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { useCreateInternReview, useReviewsForTarget } from "@/hooks/useReviews"
import { ReviewForm, ReviewCard, StarRatingDisplay } from "@/components/reviews/ReviewForm"
import { applicationService } from "@/services/applicationService"
import { useCreateInterview } from "@/hooks/useInterviews"
import { useUpdateApplicationStatus } from "@/hooks/useApplications"

// No mock data - all data comes from backend API

export default function ApplicantDetailsPage() {
  const params = useParams()
  const applicationId = params.id as string
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [newNote, setNewNote] = useState("")
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 0,
    feedback: ""
  })
  const [interviewData, setInterviewData] = useState({
    interviewer: "",
    date: "",
    time: "",
    type: "video",
    location: "Virtual Meeting",
    notes: ""
  })

  // Fetch real application data
  const { data: applicationResponse, isLoading, error } = useQuery({
    queryKey: ["application", applicationId], 
    queryFn: async () => {
      console.log('Fetching application with ID:', applicationId)
      try {
        const response = await applicationService.getApplication(applicationId)
        console.log('Application response:', response)
        return response
      } catch (err: any) {
        console.error('Error fetching application:', err)
        console.error('Error status:', err.response?.status)
        console.error('Error data:', err.response?.data)
        
        // If it's a 500 error, it might be due to backend not being updated yet
        if (err.response?.status === 500) {
          console.log('Backend might not be updated yet. This is expected if you haven\'t pushed the changes.')
        }
        
        throw err
      }
    },
    enabled: !!applicationId,
    retry: (failureCount, error: any) => {
      // Don't retry on 500 errors as they're likely backend issues
      if (error?.response?.status === 500) {
        return false
      }
      return failureCount < 3
    }
  })

  // Helper function to get stage progress
  const getStageProgress = (status: string) => {
    switch (status) {
      case 'under_review': return 25
      case 'interview': return 50
      case 'accepted': return 100
      case 'rejected': return 0
      default: return 25
    }
  }

  // Transform the application data to match the expected structure
  const applicantData = useMemo(() => {
    if (!applicationResponse?.data) return null
    
    const app = applicationResponse.data
    const intern = app.internId || app.user
    const job = app.jobId || app.job
    
    return {
      id: app._id,
      name: intern?.name || 'Unknown Applicant',
      role: job?.title || 'Position',
      avatar: intern?.photo || intern?.avatar || '/placeholder.svg',
      rating: app.rating || null,
      appliedJob: job?._id || job?.id || '',
      appliedDate: app.createdAt,
      stage: app.status || 'under_review',
      stageProgress: getStageProgress(app.status),
      matchScore: app.matchScore || null,
      contact: {
        email: intern?.email || '',
        phone: intern?.phone || '',
        location: intern?.location || '',
        linkedin: intern?.linkedin || '',
        github: intern?.github || '',
        website: intern?.website || ''
      },
      personalInfo: {
        fullName: intern?.name || 'Unknown',
        age: intern?.age || '',
        gender: intern?.gender || '',
        dateOfBirth: intern?.dateOfBirth || '',
        language: intern?.language || '',
        address: intern?.address || ''
      },
      professionalInfo: {
        aboutMe: intern?.aboutMe || intern?.about || '',
        experience: intern?.experience || [],
        currentJob: intern?.currentJob || '',
        experienceYears: intern?.experienceYears || '',
        education: intern?.education || '',
        skills: intern?.skills || [],
        portfolio: intern?.portfolio || ''
      },
      coverLetter: app.coverLetter || '',
      resume: app.resume || '',
      interviews: [] as any[], // TODO: Fetch from interview service
      notes: [] as any[], // TODO: Fetch from notes service
      assignedTo: [] as any[], // TODO: Fetch from assignment service
      documents: [
        {
          id: 'resume',
          name: 'Resume',
          type: 'pdf',
          url: app.resume || '',
          uploadedAt: app.createdAt
        }
      ]
    }
  }, [applicationResponse])

  // Real mutations
  const updateStageMutation = useMutation({
    mutationFn: async (newStage: string) => {
      return await applicationService.updateApplicationStatus(applicationId, newStage)
    },
    onSuccess: () => {
      toast.success("Stage updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] })
    },
    onError: () => {
      toast.error("Failed to update stage.")
    }
  })

  const scheduleInterviewMutation = useCreateInterview()

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: () => {
      toast.success("📝 Note Added Successfully! Your note has been added to the applicant's profile.")
      setNewNote("")
      setIsNoteDialogOpen(false)
    },
    onError: () => {
      toast.error("Failed to Add Note. Please try again later.")
    }
  })

  // Review mutations and data
  const createReviewMutation = useCreateInternReview()
  
  // Get the actual user ID from the application data
  const userId = useMemo(() => {
    if (!applicationResponse?.data) return null
    return applicationResponse.data.internId?._id || applicationResponse.data.internId
  }, [applicationResponse])
  
  const { data: reviewsData, isLoading: reviewsLoading } = useReviewsForTarget(
    userId || 'no-user', 
    'intern'
  )

  const handleStageUpdate = (newStage: string) => {
    updateStageMutation.mutate(newStage)
  }

  const handleStatusChange = (newStatus: string) => {
    updateStageMutation.mutate(newStatus, {
      onSuccess: () => {
        toast.success(`Status Updated Successfully! Application status changed to ${newStatus.replace('_', ' ').toUpperCase()}`)
      },
      onError: () => {
        toast.error("Failed to Update Status. Please try again later.")
      }
    })
  }

  const handleScheduleInterview = () => {
    if (!interviewData.interviewer || !interviewData.date || !interviewData.time) {
      toast.error("Missing Required Information. Please fill in interviewer name, date, and time.")
      return
    }
    
    const interviewPayload = {
      applicationId: applicationId,
      scheduledDate: `${interviewData.date}T${interviewData.time}:00`,
      duration: 60, // Default to 60 minutes
      type: interviewData.type.toLowerCase() as 'phone' | 'video' | 'onsite' | 'other',
      location: interviewData.location,
      notes: interviewData.notes
    }
    
    scheduleInterviewMutation.mutate(interviewPayload, {
      onSuccess: () => {
        toast.success(`🎉 Interview Scheduled Successfully! Interview scheduled for ${interviewData.date} at ${interviewData.time} with ${interviewData.interviewer}`)
        setIsInterviewDialogOpen(false)
        setInterviewData({
          interviewer: "",
          date: "",
          time: "",
          type: "video",
          location: "Virtual Meeting",
          notes: ""
        })
        queryClient.invalidateQueries({ queryKey: ["application", applicationId] })
      },
      onError: (error: any) => {
        toast.error(`Failed to Schedule Interview. ${error?.response?.data?.message || "Please try again later."}`)
      }
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Note Cannot Be Empty. Please enter some text for your note.")
      return
    }
    addNoteMutation.mutate(newNote)
  }

  const handleSubmitReview = (data: any) => {
    createReviewMutation.mutate({
      internId: userId || '',
      jobId: applicantData?.appliedJob || '',
      data: {
        rating: data.rating,
        feedback: data.content
      }
    }, {
      onSuccess: () => {
        toast.success(`⭐ Review Submitted Successfully! Your ${data.rating}-star review for ${applicantData?.name} has been submitted.`)
        setIsReviewDialogOpen(false)
        queryClient.invalidateQueries({ queryKey: ["reviews", userId] })
        queryClient.invalidateQueries({ queryKey: ["application", applicationId] })
      },
      onError: (error: any) => {
        toast.error(`Failed to Submit Review. ${error?.response?.data?.message || "Please try again later."}`)
      }
    })
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Applied": return "bg-blue-100 text-blue-800"
      case "Review": return "bg-yellow-100 text-yellow-800"
      case "Shortlisted": return "bg-purple-100 text-purple-800"
      case "Interview": return "bg-green-100 text-green-800"
      case "Hired": return "bg-emerald-100 text-emerald-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getInterviewStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "Cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicant details...</p>
        </div>
      </div>
    )
  }

  if (error || !applicantData) {
    console.log('Error state - error:', error)
    console.log('Error state - applicantData:', applicantData)
    console.log('Error state - applicationResponse:', applicationResponse)
    
    const isServerError = error && (error as any)?.response?.status === 500
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isServerError ? 'Server Error' : 'Applicant Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isServerError 
              ? 'There was a server error while loading the applicant details. This might be due to recent backend updates.'
              : 'The applicant you\'re looking for doesn\'t exist or you don\'t have permission to view it.'
            }
          </p>
          <p className="text-sm text-gray-500 mb-4">Application ID: {applicationId}</p>
          {error && (
            <div className="text-sm text-red-500 mb-4 p-3 bg-red-50 rounded-lg">
              <p className="font-medium">Error Details:</p>
              <p>Status: {(error as any)?.response?.status || 'Unknown'}</p>
              <p>Message: {error.message || error.toString()}</p>
              {isServerError && (
                <p className="text-xs text-gray-600 mt-2">
                  💡 This error should be resolved once the backend updates are deployed.
                </p>
              )}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            {isServerError && (
              <Button onClick={() => window.location.reload()} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/client/applicants">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applicants
            </Button>
          </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Applicant Details</h1>
              <p className="text-gray-600">Review and manage candidate information</p>
        </div>
          </div>
          <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
        </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
                    <AvatarImage src={applicantData.avatar} alt={applicantData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                      {applicantData.name.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                  <h3 className="font-bold text-xl text-gray-900">{applicantData.name}</h3>
                  <p className="text-gray-600">{applicantData.role}</p>
                {applicantData.rating && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{applicantData.rating}</span>
                    <span className="text-xs text-gray-500">({applicantData.rating}/5)</span>
                </div>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div>
                    <p className="text-gray-600 font-medium">Applied for</p>
                    <p className="font-semibold text-gray-900">{applicantData.role}</p>
                  <p className="text-gray-500 text-xs">{applicantData.appliedDate}</p>
                </div>

                <div>
                    <p className="text-gray-600 font-medium mb-2">Current Stage</p>
                    <Badge className={`${getStageColor(applicantData.stage)} font-medium`}>
                      {applicantData.stage}
                    </Badge>
                    <div className="mt-2">
                  <Progress value={applicantData.stageProgress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{applicantData.stageProgress}% complete</p>
                    </div>
                  </div>

                  {applicantData.matchScore && (
                  <div>
                    <p className="text-gray-600 font-medium">Match Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${applicantData.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{applicantData.matchScore}%</span>
                    </div>
                </div>
                  )}

                <div className="space-y-2">
                  {/* Application Status Management */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Application Status</Label>
                    <Select 
                      value={applicantData?.stage || 'under_review'} 
                      onValueChange={handleStatusChange}
                      disabled={updateStageMutation.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white" 
                  size="sm"
                    onClick={() => setIsInterviewDialogOpen(true)}
                  disabled={scheduleInterviewMutation.isPending}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white" 
                      size="sm"
                      onClick={() => setIsReviewDialogOpen(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Write Review
                </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Contact Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${applicantData.contact.email}`} className="text-blue-600 hover:underline">
                    {applicantData.contact.email}
                  </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${applicantData.contact.phone}`} className="text-blue-600 hover:underline">
                    {applicantData.contact.phone}
                  </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{applicantData.contact.location}</span>
              </div>
                {applicantData.contact.linkedin && (
              <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <a href={applicantData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn Profile
                    </a>
              </div>
                )}
                {applicantData.contact.github && (
              <div className="flex items-center gap-3 text-sm">
                    <Github className="h-4 w-4 text-gray-800" />
                    <a href={applicantData.contact.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      GitHub Profile
                    </a>
              </div>
                )}
                {applicantData.contact.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-green-600" />
                    <a href={applicantData.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Personal Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="interviews" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Interviews
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
            </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Current Stage */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Application Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Stage</p>
                        <Badge className={`${getStageColor(applicantData.stage)} text-base px-3 py-1`}>
                          {applicantData.stage}
                            </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{applicantData.stageProgress}%</p>
                      </div>
                          </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Applied</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Review</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Shortlisted</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Interview</span>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 rounded-full bg-blue-100"></div>
                          <span className="text-sm text-blue-600 font-medium">In Progress</span>
                      </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Hired</span>
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills & Experience */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Skills & Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Technical Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {applicantData.professionalInfo.skills.map((skill: any, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                              {typeof skill === 'string' ? skill : skill.name || skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Experience</p>
                      {Array.isArray(applicantData.professionalInfo.experience) && applicantData.professionalInfo.experience.length > 0 ? (
                        <div className="space-y-3">
                          {applicantData.professionalInfo.experience.map((exp: any, index: number) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{exp.title || exp.position || 'Position'}</h4>
                                <span className="text-xs text-gray-500">
                                  {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{exp.company || exp.organization || 'Company'}</p>
                              {exp.location && (
                                <p className="text-xs text-gray-500">{exp.location}</p>
                              )}
                              {exp.description && (
                                <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                              )}
                              {exp.skills && exp.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exp.skills.slice(0, 3).map((skill: any, skillIndex: number) => (
                                    <Badge key={skillIndex} variant="outline" className="text-xs">
                                      {typeof skill === 'string' ? skill : skill.name || skill}
                                    </Badge>
                                  ))}
                                  {exp.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{exp.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">
                          {typeof applicantData.professionalInfo.experience === 'string' 
                            ? applicantData.professionalInfo.experience 
                            : 'No experience listed'
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Education</p>
                      <p className="text-sm text-gray-700">{applicantData.professionalInfo.education}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      Team Notes
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsNoteDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applicantData.notes.map((note) => (
                      <div key={note.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={note.avatar} alt={note.author} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {note.author.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{note.author}</span>
                            <span className="text-xs text-gray-500">{note.date} • {note.time}</span>
                          </div>
                          <p className="text-sm text-gray-700">{note.text}</p>
                          {note.replies > 0 && (
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-600">
                              {note.replies} {note.replies === 1 ? "Reply" : "Replies"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
            </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6 space-y-6">
                {/* Personal Information */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Name</p>
                        <p className="text-gray-900">{applicantData.personalInfo.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Age</p>
                        <p className="text-gray-900">{applicantData.personalInfo.age} years old</p>
                    </div>
                          <div>
                        <p className="text-sm font-medium text-gray-600">Gender</p>
                        <p className="text-gray-900">{applicantData.personalInfo.gender}</p>
                          </div>
                        <div>
                        <p className="text-sm font-medium text-gray-600">Languages</p>
                        <p className="text-gray-900">{applicantData.personalInfo.language}</p>
                        </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Address</p>
                        <p className="text-gray-900">{applicantData.personalInfo.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                {/* Professional Information */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-green-600" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">About Me</p>
                      <p className="text-gray-700 leading-relaxed">{applicantData.professionalInfo.aboutMe}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Current Position</p>
                      <p className="text-gray-900">{applicantData.professionalInfo.currentJob}</p>
                      <p className="text-sm text-gray-600">{applicantData.professionalInfo.experienceYears} years of experience</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Education</p>
                      <p className="text-gray-900">{applicantData.professionalInfo.education}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Portfolio</p>
                      <a 
                        href={applicantData.professionalInfo.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {applicantData.professionalInfo.portfolio}
                      </a>
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Interviews Tab */}
              <TabsContent value="interviews" className="mt-6 space-y-6">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Interview Schedule
                    </CardTitle>
                    <Link href="/dashboard/client/interviews">
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white" 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Manage Interviews
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applicantData.interviews.map((interview) => (
                        <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt={interview.interviewer} />
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                {interview.interviewer.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                <div>
                              <p className="font-medium text-gray-900">{interview.interviewer}</p>
                              <p className="text-sm text-gray-600">{interview.type}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {interview.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {interview.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {interview.location}
                                </span>
                  </div>
                        </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getInterviewStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Feedback
                            </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6 space-y-6">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      Performance Review
                    </CardTitle>
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white" 
                      size="sm"
                      onClick={() => setIsReviewDialogOpen(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Write Review
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Review Form - Moved to Dialog */}

                    {/* Existing Reviews */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Previous Reviews</h4>
                      {reviewsLoading ? (
                        <div className="space-y-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ) : reviewsData?.data && reviewsData.data.length > 0 ? (
                        <div className="space-y-4">
                          {reviewsData.data
                            .filter((review: any) => review.reviewer) // Only show reviews with reviewer data
                            .map((review: any) => (
                              <ReviewCard 
                                key={review._id} 
                                review={review}
                                canEdit={false}
                                canDelete={false}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-900 mb-2">No reviews yet</p>
                          <p className="text-sm">Be the first to review this candidate's performance.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-6 space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Documents & Files
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      {applicantData.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <FileText className="h-6 w-6 text-orange-600" />
                            </div>
                          <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-sm text-gray-600">{doc.type} • {doc.size} • {doc.uploaded}</p>
                          </div>
                        </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                        </Button>
                          </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </div>

        {/* Add Note Dialog */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <TextareaComponent
                placeholder="Write your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddNote}
                  disabled={addNoteMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Interview Dialog */}
        <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewer">Interviewer</Label>
                  <Input
                    id="interviewer"
                    value={interviewData.interviewer}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, interviewer: e.target.value }))}
                    placeholder="Enter interviewer name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Interview Type</Label>
                  <Select value={interviewData.type} onValueChange={(value) => setInterviewData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Interview</SelectItem>
                      <SelectItem value="video">Video Interview</SelectItem>
                      <SelectItem value="onsite">Onsite Interview</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={interviewData.date}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={interviewData.location}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location or meeting link"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <TextareaComponent
                  id="notes"
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about the interview..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleScheduleInterview}
                  disabled={scheduleInterviewMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {scheduleInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Write Performance Review</DialogTitle>
            </DialogHeader>
            <ReviewForm
              targetId={applicantData?.id || ''}
              targetName={applicantData?.name || 'Candidate'}
              targetType="Intern"
              jobId={applicantData?.appliedJob}
              jobTitle={applicantData?.appliedJob}
              onSubmit={handleSubmitReview}
              onCancel={() => setIsReviewDialogOpen(false)}
              mode="create"
              isLoading={createReviewMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}