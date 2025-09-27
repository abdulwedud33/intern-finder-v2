"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { MapPin, ChevronRight, Loader2 } from "lucide-react"
import { Tooltip } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCompanyApplications } from "@/hooks/useApplications"
import { useListings } from "@/hooks/useListings"
import { useAuth } from "@/hooks/useAuth"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface Application {
  id: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'on_hold';
  createdAt: string;
  // Add other application properties as needed
}

interface Listing {
  id: string;
  status: 'open' | 'closed' | 'draft';
  title: string;
  company: string;
  location: string;
  type: string;
  // Add other listing properties as needed
}

interface ApplicationsResponse {
  data: {
    applications: Application[];
  };
}

interface ListingsResponse {
  data: {
    listings: Listing[];
  };
}

// Process application data for the charts
function processApplicationData(applications: Application[]) {
  if (!applications?.length) return { jobStatsData: [], applicationSummaryData: [] };
  
  // Group by status
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create summary data
  const applicationSummaryData = [
    { name: "Shortlisted", value: statusCounts['shortlisted'] || 0, color: "#10b981" },
    { name: "On Hold", value: statusCounts['on_hold'] || 0, color: "#f59e0b" },
    { name: "Rejected", value: statusCounts['rejected'] || 0, color: "#ef4444" },
    { name: "In Review", value: statusCounts['pending'] || 0, color: "#3b82f6" },
  ];

  // Generate weekly stats (simplified example)
  const jobStatsData = [
    { day: "Mon", views: 0, applied: 0 },
    { day: "Tue", views: 0, applied: 0 },
    { day: "Wed", views: 0, applied: 0 },
    { day: "Thu", views: 0, applied: 0 },
    { day: "Fri", views: 0, applied: 0 },
    { day: "Sat", views: 0, applied: 0 },
    { day: "Sun", views: 0, applied: 0 },
  ];

  return { jobStatsData, applicationSummaryData };
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data: applicationsData, isLoading: isLoadingApplications, error: applicationsError } = useCompanyApplications() as { data: ApplicationsResponse | undefined; isLoading: boolean; error: Error | null };
  const { data: listingsData, isLoading: isLoadingListings, error: listingsError } = useListings() as { data: ListingsResponse | undefined; isLoading: boolean; error: Error | null };

  const applications = applicationsData?.data?.applications || [];
  const listings = listingsData?.data?.listings || [];
  
  const { jobStatsData, applicationSummaryData } = processApplicationData(applications);
  
  const totalCandidates = applications.length;
  const newCandidates = applications.filter((app: Application) => 
    new Date(app.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const openPositions = listings.filter((listing: Listing) => listing.status === 'open').length;

  if (isLoadingApplications || isLoadingListings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (applicationsError || listingsError) {
    return (
      <div className="p-4 text-red-500">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user?.name || 'there'}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your job postings and applications.
          </p>
        </div>
        <div className="text-sm border-2 p-2 rounded-md text-gray-500">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">New Candidates to review</p>
                <p className="text-3xl font-bold">{newCandidates}</p>
              </div>
              <ChevronRight className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Total Applications</p>
                <p className="text-3xl font-bold">{totalCandidates}</p>
              </div>
              <ChevronRight className="h-8 w-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Open Positions</p>
                <p className="text-3xl font-bold">{openPositions}</p>
              </div>
              <ChevronRight className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Statistics Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Job Statistics</CardTitle>
              <span className="text-sm text-gray-500">
                Showing statistics for {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex space-x-4 mt-4">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                Overview
              </button>
              <button className="px-3 py-1 text-gray-500 rounded-md text-sm font-medium">
                Applications
              </button>
              <button className="px-3 py-1 text-gray-500 rounded-md text-sm font-medium">
                Views
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={jobStatsData} barGap={10}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar 
                    dataKey="views" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                  />
                  <Bar 
                    dataKey="applied" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Job Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span>Job Applied</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold">2,342</h3>
                <p className="text-sm text-gray-600">Job Views</p>
                <p className="text-xs text-green-500 mt-1">This Week: 6.4%</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold">654</h3>
                <p className="text-sm text-gray-600">Job Applied</p>
                <p className="text-xs text-green-500 mt-1">This Week: 0.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Job Open Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Job Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold">12</p>
                <p className="text-sm text-gray-500">Jobs Opened</p>
              </div>
            </CardContent>
          </Card>

          {/* Applicants Summary Card */}
           <Card>
    <CardHeader>
      <CardTitle>Applications Summary</CardTitle>
      <div className="text-center">
        <p className="text-3xl font-bold">147</p>
        <p className="text-sm text-gray-500">Total Applicants</p>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {applicationSummaryData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
        </div>
      </div>

      {/* Job Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Listings</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/client/jobListings">View all jobs</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : listingsError ? (
            <div className="text-red-500 p-4">Failed to load job listings. Please try again later.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.slice(0, 4).map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <Avatar className="bg-gray-100 text-gray-700">
                        <span className="text-lg font-medium">{job.company.charAt(0).toUpperCase()}</span>
                      </Avatar>
                      <Badge 
                        variant={job.status === 'open' ? 'default' : 'secondary'}
                        className="text-xs capitalize"
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="mt-auto pt-2">
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          {job.type}
                        </span>
                        <span>
                          {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={`/dashboard/client/jobListings/${job.id}`}>View</a>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={`/dashboard/client/jobListings/${job.id}/edit`}>Edit</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {listings.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p className="mb-4">No job listings found.</p>
                  <Button asChild>
                    <a href="/dashboard/client/jobListings/new">Create your first job posting</a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
