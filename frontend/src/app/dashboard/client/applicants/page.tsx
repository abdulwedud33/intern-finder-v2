"use client"

import React, { useState, useCallback, useMemo } from "react"
import { 
  Search, 
  MoreHorizontal, 
  Star, 
  Calendar, 
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  BarChart3,
  Target,
  Award,
  Building2,
  User,
  FileText,
  MessageSquare,
  Settings,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCompanyApplications, useUpdateApplicationStatus } from "@/hooks/useApplications"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Types
type Application = {
  _id: string
  job: {
    _id: string
    title: string
    company: {
      _id: string
      name: string
    }
  }
  user: {
    _id: string
    name: string
    email: string
    phone?: string
    location?: string
      avatar?: string
    skills?: string[]
    experience?: string
  }
  status: 'under_review' | 'interview' | 'accepted' | 'rejected'
  coverLetter?: string
  createdAt: string
  updatedAt: string
  rating?: number
  matchScore?: number
}

type Stage = {
  id: Application['status']
  title: string
  className: string
  color: string
  count: number
}

const STAGES: Omit<Stage, 'count'>[] = [
  { id: 'under_review', title: 'Under Review', className: 'bg-blue-100 text-blue-800', color: 'blue' },
  { id: 'interview', title: 'Interview', className: 'bg-purple-100 text-purple-800', color: 'purple' },
  { id: 'accepted', title: 'Accepted', className: 'bg-green-100 text-green-800', color: 'green' },
  { id: 'rejected', title: 'Rejected', className: 'bg-red-100 text-red-800', color: 'red' }
]

// No mock data - all stats will come from backend

// Application Card Component
function ApplicationCard({ application, onAction }: { application: Application; onAction: (action: string, application: Application) => void }) {
  const status = STAGES.find(s => s.id === application.status) || STAGES[0]
  const internName = application.user?.name || 'Unknown Applicant'
  const initials = internName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
  
  return (
    <Card className="mb-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.user?.avatar || "/placeholder-user.jpg"} alt={internName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link 
                href={`/dashboard/client/applicants/${application._id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {internName}
              </Link>
              <p className="text-sm text-gray-600">
                {application.job?.title || 'Position'} at {application.job?.company?.name || 'Company'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {application.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{application.rating}</span>
                  </div>
                )}
                {application.matchScore && (
                  <Badge variant="outline" className="text-xs">
                    {application.matchScore}% match
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAction('view', application)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('schedule', application)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction('update_status', application)}>
                <Settings className="h-4 w-4 mr-2" />
                Update Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <Badge className={`${status.className} font-medium`}>
            {status.title}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {new Date(application.createdAt).toLocaleDateString()}
          </div>
        </div>
        {application.user?.skills && application.user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {application.user.skills.slice(0, 3).map((skill: any, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {typeof skill === 'string' ? skill : skill.name || skill}
              </Badge>
            ))}
            {application.user.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{application.user.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Interview Scheduling Modal
function ScheduleInterviewModal({
  applicationId,
  isOpen,
  onClose,
  onSchedule,
}: {
  applicationId: string
  isOpen: boolean
  onClose: () => void
  onSchedule: (data: { date: Date; note: string }) => Promise<void>
}) {
  const [date, setDate] = useState<Date>(new Date())
  const [note, setNote] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsScheduling(true)
      await onSchedule({ date, note })
      onClose()
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Interview
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date and Time</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={format(date, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setDate(new Date(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              placeholder="Add any notes about the interview..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isScheduling} className="bg-blue-600 hover:bg-blue-700">
              {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Status Update Modal
function StatusUpdateModal({
  application,
  isOpen,
  onClose,
  onUpdate,
}: {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (status: string) => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Set initial status when modal opens
  React.useEffect(() => {
    if (application && isOpen) {
      setSelectedStatus(application.status)
    }
  }, [application, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStatus && selectedStatus !== application?.status) {
      onUpdate(selectedStatus)
      onClose()
    }
  }

  if (!application) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Update Application Status
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{application.user?.name}</h4>
            <p className="text-sm text-gray-600">{application.job?.title}</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Current Status: </span>
              <Badge className={`${STAGES.find(s => s.id === application.status)?.className || 'bg-gray-100 text-gray-800'} text-xs`}>
                {STAGES.find(s => s.id === application.status)?.title || application.status}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.className.replace('text-', 'bg-').replace('bg-blue-100', 'bg-blue-500').replace('bg-purple-100', 'bg-purple-500').replace('bg-green-100', 'bg-green-500').replace('bg-red-100', 'bg-red-500')}`}></div>
                        {stage.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedStatus || selectedStatus === application.status}
              >
                Update Status
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main component
export default function ApplicantsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch applications
  const {
    data: applicationsData,
    isLoading,
    isError,
    error
  } = useCompanyApplications()

  const applications = useMemo(() => {
    const data = (applicationsData as any)?.data || []
    console.log('Raw applications data:', applicationsData)
    
    const mappedApplications = data.map((app: any) => ({
      _id: app._id,
      job: {
        _id: app.jobId?._id || '',
        title: app.jobId?.title || 'Position',
        company: {
          _id: app.jobId?.companyId?._id || app.companyId || '',
          name: app.jobId?.companyId?.name || app.jobId?.companyName || 'Company'
        }
      },
      user: {
        _id: app.internId?._id || '',
        name: app.internId?.name || 'Unknown',
        email: app.internId?.email || '',
        phone: app.internId?.phone || '',
        location: app.internId?.location || '',
        avatar: app.internId?.photo || app.internId?.avatar || '',
        skills: app.internId?.skills || [],
        experience: app.internId?.experience || ''
      },
      status: app.status || 'under_review',
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      rating: app.rating || null, // Only show if available from backend
      matchScore: app.matchScore || null // Only show if available from backend
    }))
    
    console.log('Mapped applications:', mappedApplications)
    return mappedApplications
  }, [applicationsData])

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter((app: any) => 
        app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app: any) => app.status === statusFilter)
    }

    return filtered
  }, [applications, searchTerm, statusFilter])

  // Calculate stage counts
  const stageCounts = useMemo(() => {
    const counts = STAGES.map(stage => ({
      ...stage,
      count: applications.filter((app: any) => app.status === stage.id).length
    }))
    return counts
  }, [applications])

  // Calculate real stats from applications data
  const realStats = useMemo(() => {
    console.log('Final applications array:', applications)
    console.log('Applications count:', applications.length)
    const totalApplications = applications.length
    const interviews = applications.filter((app: any) => app.status === 'interview').length
    const hired = applications.filter((app: any) => app.status === 'accepted').length
    
    // Calculate new applications this week (applications created in last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newApplications = applications.filter((app: any) => 
      new Date(app.createdAt) > oneWeekAgo
    ).length

    // Calculate average rating (only from applications that have ratings)
    const applicationsWithRatings = applications.filter((app: any) => app.rating)
    const averageRating = applicationsWithRatings.length > 0 
      ? applicationsWithRatings.reduce((sum: number, app: any) => sum + app.rating, 0) / applicationsWithRatings.length
      : 0

    return {
      totalApplications,
      newApplications,
      interviews,
      hired,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      responseRate: totalApplications > 0 ? Math.round((interviews / totalApplications) * 100) : 0
    }
  }, [applications])

  // Mutations
  const updateStatusMutation = useUpdateApplicationStatus()

  // Router for navigation
  const router = useRouter()

  // Handlers
  const handleAction = (action: string, application: Application) => {
    switch (action) {
      case 'view':
        router.push(`/dashboard/client/applicants/${application._id}`)
        break
      case 'schedule':
        setSelectedApplication(application)
        setIsInterviewModalOpen(true)
        break
      case 'message':
        // TODO: Implement messaging
        toast({
          title: "Messaging",
          description: "This feature will be implemented soon.",
        })
        break
      case 'update_status':
        setSelectedApplication(application)
        setIsStatusModalOpen(true)
        break
      case 'decline':
        if (window.confirm('Are you sure you want to decline this application?')) {
          updateStatusMutation.mutate({ 
            applicationId: application._id, 
            status: 'rejected' 
          }, {
            onSuccess: () => {
              toast({
                title: "Application declined",
                description: "The application has been declined.",
              })
            },
            onError: () => {
              toast({
                title: "Failed to decline application",
                description: "Please try again later.",
                variant: "destructive",
              })
            }
          })
        }
        break
    }
  }

  const handleScheduleInterview = async (data: { date: Date; note: string }) => {
    if (!selectedApplication) return
    // TODO: Implement interview scheduling
    toast({
      title: "Interview scheduled",
      description: `Interview scheduled for ${data.date.toLocaleDateString()}`,
    })
  }

  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedApplication) return
    
    updateStatusMutation.mutate({ 
      applicationId: selectedApplication._id, 
      status: newStatus 
    }, {
      onSuccess: () => {
        toast({
          title: "Status updated",
          description: `Application status changed to ${STAGES.find(s => s.id === newStatus)?.title || newStatus}`,
        })
        setIsStatusModalOpen(false)
        setSelectedApplication(null)
      },
      onError: () => {
        toast({
          title: "Update failed",
          description: "Failed to update application status. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="flex space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Failed to load applications. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Applicant Management
        </h1>
            <p className="text-gray-600">
              Manage and track all job applications from candidates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold">{realStats.totalApplications}</p>
                  <p className="text-blue-100 text-xs">+{realStats.newApplications} this week</p>
                </div>
                <FileText className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Interviews</p>
                  <p className="text-3xl font-bold">{realStats.interviews}</p>
                  <p className="text-green-100 text-xs">+2 this week</p>
                </div>
                <Users className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Hired</p>
                  <p className="text-3xl font-bold">{realStats.hired}</p>
                  <p className="text-purple-100 text-xs">+1 this week</p>
                </div>
                <Award className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Response Rate</p>
                  <p className="text-3xl font-bold">{realStats.responseRate}%</p>
                  <p className="text-orange-100 text-xs">+5% this week</p>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                placeholder="Search by name, job title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Applications
                </DropdownMenuItem>
                {STAGES.map((stage) => (
                  <DropdownMenuItem key={stage.id} onClick={() => setStatusFilter(stage.id)}>
                    {stage.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "pipeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("pipeline")}
              className="text-xs"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Pipeline View
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="text-xs"
            >
              <Table className="h-4 w-4 mr-2" />
              Table View
            </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'pipeline' ? (
        // Pipeline View with Tabs
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Application Pipeline</h2>
            <div className="text-sm text-gray-600">
              {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <Badge variant="secondary" className="text-xs">
                  {filteredApplications.length}
                </Badge>
              </TabsTrigger>
              {stageCounts.map((stage) => (
                <TabsTrigger key={stage.id} value={stage.id} className="flex items-center gap-2">
                  {stage.title}
                  <Badge variant="secondary" className={`text-xs ${stage.className}`}>
                    {stage.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {filteredApplications.map((application: Application) => (
                  <ApplicationCard 
                    key={application._id}
                    application={application} 
                    onAction={handleAction} 
                  />
                ))}
                {filteredApplications.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p>No applications found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {stageCounts.map((stage) => {
              const stageApplications = filteredApplications.filter((app: any) => app.status === stage.id)
              return (
                <TabsContent key={stage.id} value={stage.id} className="mt-6">
                  <div className="grid gap-4">
                    {stageApplications.map((application: Application) => (
                      <ApplicationCard 
                        key={application._id}
                        application={application} 
                        onAction={handleAction} 
                      />
                    ))}
                    {stageApplications.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <p>No applications in {stage.title.toLowerCase()} stage</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      ) : (
        // Table View
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-gray-600" />
                All Applications
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                    <TableHead className="w-[300px]">Candidate</TableHead>
                    <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Job Role</TableHead>
                    <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {filteredApplications.map((application: Application) => {
                    const status = STAGES.find(s => s.id === application.status) || STAGES[0]
                return (
                      <TableRow key={application._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.user.avatar || "/placeholder-user.jpg"} alt={application.user.name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {application.user.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                              <Link 
                                href={`/dashboard/client/applicants/${application._id}`}
                                className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {application.user.name}
                              </Link>
                              <div className="text-sm text-gray-500">{application.user.email}</div>
                              {application.user.location && (
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {application.user.location}
                                </div>
                              )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                          <Badge className={`${status.className} font-medium`}>
                        {status.title}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                          {new Date(application.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-600">
                          {application.job.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{application.rating}</span>
                          </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleAction('view', application)}>
                                <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('schedule', application)}>
                                <Calendar className="h-4 w-4 mr-2" />
                            Schedule Interview
                          </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('message', application)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction('update_status', application)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAction('decline', application)} 
                            className="text-red-600"
                          >
                                <XCircle className="h-4 w-4 mr-2" />
                            Decline Application
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
              {filteredApplications.length === 0 && (
            <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No applications found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm ? "Try adjusting your search criteria" : "Applications will appear here when candidates apply"}
                  </p>
            </div>
          )}
        </div>
          </Card>
      )}
      
      {/* Interview Modal */}
      <ScheduleInterviewModal
          applicationId={selectedApplication?._id || ''}
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false)
          setSelectedApplication(null)
        }}
        onSchedule={handleScheduleInterview}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        application={selectedApplication}
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedApplication(null)
        }}
        onUpdate={handleStatusUpdate}
      />
      </div>
    </div>
  )
}