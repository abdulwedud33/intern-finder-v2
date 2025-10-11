"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  FileText, 
  Users, 
  Briefcase, 
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Eye,
  ArrowRight,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Target,
  Award,
  BarChart3,
  Activity,
  Zap,
  RefreshCw,
  User
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useJobs } from "@/hooks/useJobs"
import { useMyApplications } from "@/hooks/useApplications"
import { useMyInterviews } from "@/hooks/useInterviews"
import { useDashboardStats, useApplicationStats, useInterviewStats } from "@/hooks/useStats"
import { getUserAvatarUrl } from "@/utils/imageUtils"
import { LoadingPage } from "@/components/ui/loading-spinner"
 
// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "accepted":
    case "hired":
      return "bg-green-100 text-green-700"
    case "pending":
    case "reviewed":
      return "bg-yellow-100 text-yellow-700"
    case "rejected":
    case "declined":
      return "bg-red-100 text-red-700"
    case "scheduled":
      return "bg-blue-100 text-blue-700"
    case "completed":
      return "bg-purple-100 text-purple-700"
    case "cancelled":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

// Helper function to get status text
const getStatusText = (status: string) => {
  if (!status) return "Unknown"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function InternDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Backend data hooks
  const { data: applicationsData, isLoading: applicationsLoading } = useMyApplications()
  const { data: interviewsData, isLoading: interviewsLoading } = useMyInterviews()
  const { data: dashboardStatsData, isLoading: dashboardStatsLoading } = useDashboardStats()
  const { data: applicationStats, isLoading: applicationStatsLoading } = useApplicationStats()
  const { data: interviewStats, isLoading: interviewStatsLoading } = useInterviewStats()
  const { jobs: recentJobs, loading: jobsLoading } = useJobs({ limit: 4 })

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  if (authLoading || dashboardStatsLoading || applicationsLoading || interviewsLoading) {
    return <LoadingPage />
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Extract data from backend responses
  const applications = (applicationsData as any)?.data || (applicationsData as any)?.applications || []
  const interviews = (interviewsData as any)?.data || []
  const dashboardStats = dashboardStatsData?.data as any || {}
  
  // Calculate real statistics from backend data
  const stats = {
    totalApplications: dashboardStats?.applications?.total || applications.length,
    interviews: dashboardStats?.interviews?.total || interviews.length,
    offers: dashboardStats?.applications?.accepted || applications.filter((app: any) => app.status === 'accepted').length,
    pending: dashboardStats?.applications?.pending || applications.filter((app: any) => app.status === 'pending').length,
    rejected: dashboardStats?.applications?.rejected || applications.filter((app: any) => app.status === 'rejected').length
  }

  // Get upcoming interviews (scheduled and future dates)
  const upcomingInterviews = interviews.filter((interview: any) => 
    interview.status === 'scheduled' && 
    new Date(interview.date || interview.scheduledDate) > new Date()
  ).slice(0, 3)

  // Get recent applications (last 5)
  const recentApplications = applications.slice(0, 5)

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
                Here's your job search overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
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
                  <p className="text-blue-100 text-xs">
                    {stats.pending} pending
                  </p>
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
                  <p className="text-green-100 text-xs">
                    {upcomingInterviews.length} upcoming
                  </p>
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
                  <p className="text-purple-100 text-xs">
                    {stats.offers > 0 ? 'Congratulations!' : 'Keep applying!'}
                  </p>
                </div>
                <Award className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold">{stats.rejected}</p>
                  <p className="text-orange-100 text-xs">
                    {stats.rejected > 0 ? 'Learn and improve' : 'None yet'}
                  </p>
                </div>
                <Target className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Upcoming Interviews
                  </CardTitle>
          </CardHeader>
                <CardContent className="space-y-4">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((interview: any) => (
                  <div key={interview._id || interview.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getUserAvatarUrl({...interview.interviewer, role: 'company'})} alt={interview.interviewer?.name} />
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {interview.interviewer?.name?.split(' ').map((n: string) => n[0]).join('') || 'I'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {interview.application?.jobId?.title || interview.job?.title || 'Position'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {interview.application?.jobId?.company?.name || interview.company?.name || 'Company'}
                          </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                              {new Date(interview.date || interview.scheduledDate).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                              {new Date(interview.date || interview.scheduledDate).toLocaleDateString()}
                              </span>
                            {interview.interviewer?.name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {interview.interviewer.name}
                              </span>
                            )}
            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {interview.type?.charAt(0).toUpperCase() + interview.type?.slice(1) || 'Interview'}
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 text-xs">
                              {getStatusText(interview.status)}
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming interviews scheduled</p>
                  <p className="text-sm">Keep applying to get interview opportunities!</p>
                </div>
              )}
                  <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/intern/interviews">
                      View All Interviews
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
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
                {recentApplications.length > 0 ? (
                  recentApplications.map((application: any) => (
                    <div key={application._id || application.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getUserAvatarUrl({...application.jobId?.company, role: 'company'})} alt={application.jobId?.company?.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {application.jobId?.company?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {application.jobId?.title || application.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {application.jobId?.company?.name || application.company} • {application.jobId?.location || application.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied on {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                </Badge>
                      </div>
                        </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No applications yet</p>
                    <p className="text-sm">Start applying to jobs to see your applications here!</p>
                        </div>
                )}
              </div>
                </CardContent>
              </Card>
            </div>

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