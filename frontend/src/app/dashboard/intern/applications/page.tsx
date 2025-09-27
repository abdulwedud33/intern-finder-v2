"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Filter, MoreHorizontal } from "lucide-react"
import { useMyApplications } from "@/hooks/useApplications"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { useQuery } from "@tanstack/react-query"
import { getPublicCompanyProfile } from "@/lib/api"

// Component to fetch and display company name
function CompanyName({ companyId, fallbackName }: { companyId?: string, fallbackName: string }) {
  const { data: companyData } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyId ? getPublicCompanyProfile(companyId) : null,
    enabled: !!companyId && typeof companyId === 'string',
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const companyName = (companyData as any)?.data?.name || (companyData as any)?.name || fallbackName
  return <span className="font-medium text-gray-900">{companyName}</span>
}

export default function ApplicationsPage() {
  const { data, isLoading, error } = useMyApplications()
  // Handle different possible response structures from the backend
  const applications = (data as any)?.data || (data as any)?.applications || data || []
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold m-2 text-gray-900">My Applications</h1>
          <Separator className="my-4 w-full" />
          <p className="text-gray-600 font-bold my-1">Keep it up</p>
          <p className="text-sm text-gray-500">Here is your recent applications</p>
        </div>
        <div className="flex items-center space-x-2 border-2 p-2 rounded-md text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Recent</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center space-x-6 border-b">
        <button className="pb-2 border-b-2 border-blue-500 text-blue-600 font-medium">
          All ({Array.isArray(applications) ? applications.length : 0})
        </button>
        <button className="pb-2 text-gray-500 hover:text-gray-700">
          Pending ({Array.isArray(applications) ? applications.filter((app: any) => (app.status || app.stage || 'pending').toLowerCase() === 'pending').length : 0})
        </button>
        <button className="pb-2 text-gray-500 hover:text-gray-700">
          Interview ({Array.isArray(applications) ? applications.filter((app: any) => (app.status || app.stage || '').toLowerCase().includes('interview')).length : 0})
        </button>
        <button className="pb-2 text-gray-500 hover:text-gray-700">
          Accepted ({Array.isArray(applications) ? applications.filter((app: any) => (app.status || app.stage || '').toLowerCase() === 'accepted').length : 0})
        </button>
      </div>

      {/* Applications History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Applications History</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search" className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingCard />
          ) : error ? (
            <ErrorDisplay error={error} title="Failed to load applications" />
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No applications found. Start applying to jobs to see them here!
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 pb-3 border-b text-sm font-medium text-gray-600">
                <div>#</div>
                <div>Company Name</div>
                <div>Roles</div>
                <div>Date Applied</div>
                <div>Status</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-4 mt-4">
                {applications.map((app: any, idx: number) => {
                  // Handle different possible data structures
                  const listing = app.listing || app.job || app
                  const companyId = typeof listing?.company === 'string' ? listing.company : null
                  const fallbackCompanyName = listing?.company?.name || listing?.companyName || listing?.user?.name || "Company"
                  const jobTitle = listing?.title || "Position"
                  const applicationDate = app.createdAt || app.appliedAt || app.dateApplied
                  const status = app.hiringStage || app.status || app.stage || "pending"
                  
                  // Status styling
                  const getStatusStyle = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'accepted':
                      case 'hired':
                        return "bg-green-100 text-green-700"
                      case 'rejected':
                      case 'declined':
                        return "bg-red-100 text-red-700"
                      case 'interview':
                      case 'interviewing':
                        return "bg-blue-100 text-blue-700"
                      case 'reviewing':
                      case 'under review':
                        return "bg-yellow-100 text-yellow-700"
                      default:
                        return "bg-orange-100 text-orange-700"
                    }
                  }

                  return (
                    <div key={app._id || app.id || idx} className="grid grid-cols-5 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <div className="text-sm text-gray-600">{idx + 1}</div>
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={listing?.company?.profile?.logoUrl || ""} alt="Company Logo" />
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            {fallbackCompanyName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CompanyName companyId={companyId} fallbackName={fallbackCompanyName} />
                          <p className="text-xs text-gray-500">{listing?.location || "Remote"}</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{jobTitle}</div>
                        <p className="text-xs text-gray-500">
                          {listing?.typesOfEmployment?.join(", ") || listing?.type || "Full-time"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {applicationDate ? new Date(applicationDate).toLocaleDateString() : "—"}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={getStatusStyle(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Button variant="outline" size="sm">
              &lt;
            </Button>
            <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              4
            </Button>
            <Button variant="outline" size="sm">
              5
            </Button>
            <span className="text-sm text-gray-500">...</span>
            <Button variant="outline" size="sm">
              10
            </Button>
            <Button variant="outline" size="sm">
              &gt;
            </Button>
          </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
