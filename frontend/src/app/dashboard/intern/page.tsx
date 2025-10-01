"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MoreHorizontal, 
  FileText, 
  Users, 
  Briefcase, 
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Eye,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  Building2,
  Target,
  Award,
  BarChart3,
  Activity,
  Zap,
  Heart,
  Bookmark,
  Share2,
  Download,
  RefreshCw,
  User
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useJobs } from "@/hooks/useJobs"
import { useMyApplications } from "@/hooks/useApplications"
import { useMyInterviews } from "@/hooks/useInterviews"
import { useCompanies } from "@/hooks/useCompanies"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"

// Calculate real statistics from data
const calculateStats = (applications: any[], interviews: any[]) => {
  const totalApplications = applications.length
  const interviewsCount = interviews.length
  const offers = applications.filter((app: any) => app.status === 'hired').length
  const profileViews = 1247 // This would come from analytics API
  const savedJobs = 12 // This would come from saved jobs API
  const companiesViewed = 45 // This would come from analytics API
  
  return {
    totalApplications,
    interviews: interviewsCount,
    offers,
    profileViews,
    savedJobs,
    companiesViewed
  }
}

const mockRecentApplications = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    appliedDate: "2024-01-15",
    status: "interviewed",
    salary: "$80,000 - $100,000",
    type: "Full-time",
    logo: "/placeholder-logo.svg"
  },
  {
    id: 2,
    jobTitle: "React Developer",
    company: "StartupXYZ",
    location: "New York, NY",
    appliedDate: "2024-01-14",
    status: "in-review",
    salary: "$70,000 - $90,000",
    type: "Full-time",
    logo: "/placeholder-logo.svg"
  },
  {
    id: 3,
    jobTitle: "UI/UX Designer",
    company: "DesignStudio",
    location: "Remote",
    appliedDate: "2024-01-13",
    status: "declined",
    salary: "$60,000 - $80,000",
    type: "Contract",
    logo: "/placeholder-logo.svg"
  }
]

const mockUpcomingInterviews = [
  {
    id: 1,
    company: "TechCorp Inc.",
    position: "Frontend Developer",
    time: "10:00 AM - 11:00 AM",
    date: "Today",
    type: "Video Call",
    interviewer: "Sarah Johnson",
    avatar: "/placeholder-user.jpg",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  {
    id: 2,
    company: "StartupXYZ",
    position: "React Developer",
    time: "2:00 PM - 3:00 PM",
    date: "Tomorrow",
    type: "Phone Call",
    interviewer: "Mike Chen",
    avatar: "/placeholder-user.jpg",
    meetingLink: null,
    status: "scheduled"
  }
]

const mockApplicationStatuses = [
  {
    id: 1,
    company: "TechCorp Inc.",
    position: "Frontend Developer",
    status: "interview",
    appliedDate: "2024-01-15",
    lastUpdate: "2024-01-18",
    hasInterview: true,
    interviewDate: "2024-01-20"
  },
  {
    id: 2,
    company: "StartupXYZ",
    position: "React Developer", 
    status: "shortlisted",
    appliedDate: "2024-01-14",
    lastUpdate: "2024-01-17",
    hasInterview: true,
    interviewDate: "2024-01-22"
  },
  {
    id: 3,
    company: "DesignStudio",
    position: "UI/UX Designer",
    status: "rejected",
    appliedDate: "2024-01-13",
    lastUpdate: "2024-01-16",
    hasInterview: false,
    interviewDate: null
  }
]

const mockRecommendedJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Google",
    location: "Mountain View, CA",
    salary: "$120,000 - $150,000",
    type: "Full-time",
    posted: "2 days ago",
    logo: "/placeholder-logo.svg",
    match: 95
  },
  {
    id: 2,
    title: "React Developer",
    company: "Meta",
    location: "Menlo Park, CA",
    salary: "$110,000 - $140,000",
    type: "Full-time",
    posted: "1 day ago",
    logo: "/placeholder-logo.svg",
    match: 88
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Netflix",
    location: "Los Gatos, CA",
    salary: "$130,000 - $160,000",
    type: "Full-time",
    posted: "3 days ago",
    logo: "/placeholder-logo.svg",
    match: 92
  }
]

const mockActivityFeed = [
  {
    id: 1,
    type: "application",
    message: "You applied for Frontend Developer at TechCorp Inc.",
    time: "2 hours ago",
    icon: FileText,
    color: "text-blue-600"
  },
  {
    id: 2,
    type: "interview",
    message: "Interview scheduled with Sarah Johnson at TechCorp Inc.",
    time: "4 hours ago",
    icon: Calendar,
    color: "text-green-600"
  },
  {
    id: 3,
    type: "profile",
    message: "Your profile was viewed by 12 recruiters today",
    time: "6 hours ago",
    icon: Eye,
    color: "text-purple-600"
  },
  {
    id: 4,
    type: "recommendation",
    message: "New job recommendations based on your profile",
    time: "1 day ago",
    icon: Target,
    color: "text-orange-600"
  }
]

export default function InternDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Real data hooks
  const { jobs: featuredJobs, loading: jobsLoading } = useJobs({ limit: 4 })
  const { data: applicationsData, isLoading: applicationsLoading } = useMyApplications()
  const { data: interviewsData, isLoading: interviewsLoading } = useMyInterviews()
  const { companies, loading: companiesLoading } = useCompanies({ limit: 6 })

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  if (authLoading) return <LoadingPage />

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interviewed": return "bg-green-100 text-green-700"
      case "in-review": return "bg-yellow-100 text-yellow-700"
      case "declined": return "bg-red-100 text-red-700"
      case "applied": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "interviewed": return "Interviewed"
      case "in-review": return "In Review"
      case "declined": return "Declined"
      case "applied": return "Applied"
      default: return "Unknown"
    }
  }

  const applications = (applicationsData as any)?.data || (applicationsData as any)?.applications || mockRecentApplications
  const interviews = (interviewsData as any)?.data || []
  const stats = calculateStats(applications, interviews)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user?.name || "Intern"}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Here's what's happening with your job search today
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold">{stats.totalApplications}</p>
                  <p className="text-blue-100 text-xs">+3 this week</p>
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
                  <p className="text-3xl font-bold">{stats.interviews}</p>
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
                  <p className="text-purple-100 text-sm font-medium">Job Offers</p>
                  <p className="text-3xl font-bold">{stats.offers}</p>
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
                  <p className="text-orange-100 text-sm font-medium">Profile Views</p>
                  <p className="text-3xl font-bold">{stats.profileViews}</p>
                  <p className="text-orange-100 text-xs">+45 this week</p>
                </div>
                <Eye className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Progress */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Application Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Application Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">68%</p>
                      </div>
                      <div className="w-20 h-20">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeDasharray="68, 100"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-900">68%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Interviewed</span>
                        </div>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">In Review</span>
                        </div>
                        <span className="text-sm font-medium">33%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Declined</span>
                        </div>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Interviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Upcoming Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interviews.filter((interview: any) => interview.status === 'scheduled').slice(0, 2).map((interview: any) => (
                    <div key={interview.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={interview.interviewer?.avatar} alt={interview.interviewer?.name} />
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {interview.interviewer?.name?.split(' ').map((n: string) => n[0]).join('') || 'I'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{interview.job?.title || 'Position'}</p>
                            <p className="text-sm text-gray-600">{interview.company?.name || 'Company'}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(interview.scheduledDate).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(interview.scheduledDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {interview.interviewer?.name || 'Interviewer'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {interview.type?.charAt(0).toUpperCase() + interview.type?.slice(1) || 'Interview'}
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {interview.status?.charAt(0).toUpperCase() + interview.status?.slice(1) || 'Scheduled'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {interview.meetingLink && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/intern/applications">
                      View All Interviews
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Application Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Application Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApplicationStatuses.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Briefcase className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.position}</h4>
                          <p className="text-sm text-gray-600">{app.company}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                            <span>Updated: {new Date(app.lastUpdate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                        {app.hasInterview && app.interviewDate && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <Calendar className="h-4 w-4" />
                            <span>Interview: {new Date(app.interviewDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Recent Applications
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/intern/applications">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application: any) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.logo || "/placeholder-logo.svg"} alt={application.company} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {application.company?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{application.jobTitle || application.title}</h3>
                          <p className="text-sm text-gray-600">
                            {application.company} • {application.location} • {application.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied on {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  All Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application: any) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.logo || "/placeholder-logo.svg"} alt={application.company} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {application.company?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{application.jobTitle || application.title}</h3>
                          <p className="text-sm text-gray-600">
                            {application.company} • {application.location} • {application.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied on {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommended Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Recommended Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecommendedJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {job.match}% match
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>{job.salary}</p>
                          <p className="text-xs">{job.posted}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Featured Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Featured Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredJobs.slice(0, 3).map((job: any) => (
                    <div key={job._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company?.name || "Company"}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>{job.salary?.min && job.salary?.max ? `$${job.salary.min} - $${job.salary.max}` : "Salary not specified"}</p>
                          <p className="text-xs">{job.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/jobs/${job._id}`}>
                              View Job
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivityFeed.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/jobs">
                  <Search className="h-6 w-6" />
                  <span className="text-sm">Search Jobs</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/dashboard/intern/company">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Browse Companies</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/dashboard/intern/profile">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Update Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <Link href="/dashboard/intern/settings">
                  <Bell className="h-6 w-6" />
                  <span className="text-sm">Notifications</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}