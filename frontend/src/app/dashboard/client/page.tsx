"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart
} from "recharts"
import { 
  MapPin, 
  ChevronRight, 
  Loader2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  TrendingDown,
  Eye,
  UserCheck,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  DollarSign,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Search
} from "lucide-react"
import { Tooltip } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyJobs, useJobStats } from "@/hooks/useJobManagement"
import { useCompanyApplications, useCompanyApplicationStats } from "@/hooks/useApplications"
import { useDashboardStats, useApplicationStats, useInterviewStats } from "@/hooks/useStats"
import { useCompanyDashboardData, useChartData, useApplicationStatusChart, useRefreshDashboard } from "@/hooks/useDashboardData"
import { 
  ApplicationStatusChart, 
  WeeklyPerformanceChart, 
  JobTypeDistributionChart, 
  StatCard, 
  RecentActivity 
} from "@/components/dashboard/DynamicCharts"
import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "@/services/authService"
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  newApplications: number
  shortlistedCandidates: number
  hiredCandidates: number
  jobViews: number
  applicationRate: number
  hireRate: number
}

interface JobData {
  _id: string
  title: string
  company: string
  location: string
  type: string
  status: 'draft' | 'published' | 'closed'
  salary?: {
    min: number
    max: number
    currency: string
  }
  createdAt: string
  updatedAt: string
  applicationCount?: number
  viewCount?: number
}

interface ApplicationData {
  _id: string
  job: {
    _id: string
    title: string
  }
  user: {
    _id: string
    name: string
    email: string
    profilePictureUrl?: string
  }
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  coverLetter?: string
  createdAt: string
  updatedAt: string
}

// Helper function to generate chart data from real statistics
const generateChartData = (dashboardStats: any, applicationStats: any, jobs: JobData[]) => {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    return {
      day: format(date, 'EEE'),
      date: format(date, 'MMM dd'),
      views: Math.floor(Math.random() * 50) + 20, // This would need backend support
      applications: Math.floor(Math.random() * 15) + 5, // This would need backend support
      shortlisted: Math.floor(Math.random() * 8) + 2, // This would need backend support
      hired: Math.floor(Math.random() * 3) + 1 // This would need backend support
    }
  })

  // Generate job types data from actual jobs
  const jobTypeCounts = Array.isArray(jobs) ? jobs.reduce((acc: any, job: JobData) => {
    const type = job.type || 'Full-time'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {}) : {}

  const jobTypes = Object.entries(jobTypeCounts).map(([name, value], index) => ({
    name,
    value: value as number,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
  }))

  // Generate application status data from real stats
  const applicationStatusData = applicationStats?.map((stat: any, index: number) => ({
    name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
    value: stat.count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]
  })) || []

  return {
    weeklyData: last7Days,
    jobTypesData: jobTypes,
    applicationStatusData: applicationStatusData
  }
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('7d')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch current user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!user,
  })

  // Fetch company jobs
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useCompanyJobs()
  
  // Fetch company applications
  const { data: applicationsData, isLoading: applicationsLoading, error: applicationsError } = useCompanyApplications()
  
  // Fetch job statistics
  const { data: jobStatsData, isLoading: statsLoading } = useJobStats()
  
  // Fetch application statistics
  const { data: applicationStatsData, isLoading: applicationStatsLoading } = useCompanyApplicationStats()

  // Fetch real dashboard statistics
  const { data: dashboardStatsData, isLoading: dashboardStatsLoading } = useDashboardStats()
  const { data: applicationStats, isLoading: applicationStatsLoading2 } = useApplicationStats()
  const { data: interviewStats, isLoading: interviewStatsLoading } = useInterviewStats()

  // New dashboard data hooks
  const { 
    applicationStats: companyAppStats, 
    jobStats: companyJobStats, 
    recentApplications, 
    companyInterviews,
    isLoading: companyDataLoading 
  } = useCompanyDashboardData()
  
  const { 
    weeklyPerformanceData, 
    jobTypeDistribution, 
    recentActivity,
    isLoading: chartDataLoading 
  } = useChartData({
    dateRange: timeRange === "7d" ? {
      start: subDays(new Date(), 7).toISOString(),
      end: new Date().toISOString()
    } : timeRange === "30d" ? {
      start: subDays(new Date(), 30).toISOString(),
      end: new Date().toISOString()
    } : undefined,
    limit: 50
  })
  
  const { data: applicationStatusChart, isLoading: applicationStatusLoading } = useApplicationStatusChart()

  const jobs = Array.isArray(jobsData?.data) ? jobsData.data : []
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : []
  const dashboardStats = dashboardStatsData?.data
  const chartData = generateChartData(dashboardStats, applicationStats?.data, jobs)

  // Calculate dashboard statistics using real data
  const stats: DashboardStats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job: JobData) => job.status === 'published').length,
    totalApplications: dashboardStats?.applications?.total || applications.length,
    newApplications: applications.filter((app: ApplicationData) => 
      new Date(app.createdAt) > subDays(new Date(), 7)
    ).length,
    shortlistedCandidates: dashboardStats?.applications?.reviewed || applications.filter((app: ApplicationData) => 
      app.status === 'shortlisted' || app.status === 'reviewed'
    ).length,
    hiredCandidates: dashboardStats?.applications?.accepted || applications.filter((app: ApplicationData) => 
      app.status === 'hired'
    ).length,
    jobViews: jobs.reduce((sum: number, job: JobData) => sum + (job.viewCount || 0), 0),
    applicationRate: jobs.length > 0 ? (applications.length / jobs.length) : 0,
    hireRate: applications.length > 0 ? 
      ((dashboardStats?.applications?.accepted || applications.filter((app: ApplicationData) => app.status === 'hired').length) / applications.length) * 100 : 0
  }

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter((job: JobData) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Recent applications (last 5) - using data from API
  const recentApplicationsData = applications
    .sort((a: ApplicationData, b: ApplicationData) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  if (userLoading || jobsLoading || applicationsLoading) {
    return (
      <div className="space-y-6">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
      </div>
    )
  }

  if (jobsError || applicationsError) {
    return (
      <div className="p-4 text-red-500">
        Error loading dashboard data. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData?.name || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your job postings and applications today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/dashboard/client/jobListings/new">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          change={12.5}
          changeType="increase"
          icon={<Briefcase className="h-6 w-6" />}
          isLoading={companyDataLoading}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"
        />
        
        <StatCard
          title="New Applications"
          value={stats.newApplications}
          change={8.2}
          changeType="increase"
          icon={<Users className="h-6 w-6" />}
          isLoading={companyDataLoading}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0"
        />
        
        <StatCard
          title="Shortlisted"
          value={stats.shortlistedCandidates}
          change={-2.1}
          changeType="decrease"
          icon={<UserCheck className="h-6 w-6" />}
          isLoading={companyDataLoading}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0"
        />
        
        <StatCard
          title="Job Views"
          value={stats.jobViews.toLocaleString()}
          change={15.3}
          changeType="increase"
          icon={<Eye className="h-6 w-6" />}
          isLoading={companyDataLoading}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Performance Chart */}
          <WeeklyPerformanceChart
            data={weeklyPerformanceData}
            isLoading={chartDataLoading}
            title="Weekly Performance"
          />

          {/* Job Types Distribution */}
          <JobTypeDistributionChart
            data={jobTypeDistribution}
            isLoading={chartDataLoading}
            title="Job Types Distribution"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/client/jobListings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/client/applicants">
                  <Users className="h-4 w-4 mr-2" />
                  View Applicants
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/client/jobListings">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Jobs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/client/profile">
                  <Users className="h-4 w-4 mr-2" />
                  Company Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Applications</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/client/applicants">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplicationsData.map((application: ApplicationData) => (
                  <div key={application._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={application.user.profilePictureUrl} />
                      <AvatarFallback>
                        {application.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {application.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {application.job.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        application.status === 'hired' ? 'default' :
                        application.status === 'shortlisted' ? 'secondary' :
                        application.status === 'rejected' ? 'destructive' : 'outline'
                      }
                      className="text-xs"
                    >
                      {application.status}
                    </Badge>
                  </div>
                ))}
                {recentApplicationsData.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No recent applications
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Status Overview */}
           <Card>
    <CardHeader>
              <CardTitle className="text-lg">Application Status</CardTitle>
    </CardHeader>
    <CardContent>
              <div className="space-y-3">
                {chartData.applicationStatusData.map((item: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}</span>
            </div>
                    <Progress 
                      value={(item.value / chartData.applicationStatusData.reduce((sum: number, item: any) => sum + item.value, 0)) * 100} 
                      className="h-2"
                    />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
        </div>
      </div>

      {/* Job Listings Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Listings
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/dashboard/client/jobListings">View All</Link>
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : "Get started by creating your first job posting."
                }
              </p>
              <Button asChild>
                <Link href="/dashboard/client/jobListings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.slice(0, 6).map((job: JobData) => (
                <Card key={job._id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-teal-100 text-teal-600">
                            {job.company.charAt(0).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/client/jobListings/${job._id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/client/jobListings/${job._id}/edit`}>Edit Job</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/client/jobListings/${job._id}/applicants`}>View Applicants</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                      <span className="truncate">{job.location}</span>
                    </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="capitalize">{job.type}</span>
                      </div>

                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                        </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <Badge 
                          variant={
                            job.status === 'published' ? 'default' :
                            job.status === 'draft' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {job.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{job.applicationCount || 0}</p>
                          <p className="text-xs text-gray-600">Applications</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{job.viewCount || 0}</p>
                          <p className="text-xs text-gray-600">Views</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}