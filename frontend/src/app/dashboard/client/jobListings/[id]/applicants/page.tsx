"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Filter, MoreHorizontal, Star, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { jobService } from "@/services/jobService"
import { applicationService } from "@/services/applicationService"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"

type Application = {
  _id: string
  jobId: { _id: string; title: string; companyId: { _id: string; name: string } }
  internId: { _id: string; name: string; email: string; avatar?: string }
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  coverLetter?: string
  createdAt: string
  updatedAt: string
}

type Stage = {
  id: string
  title: string
  className: string
}

const STAGES: Stage[] = [
  { id: 'applied', title: 'Applied', className: 'bg-gray-100 text-gray-800' },
  { id: 'reviewed', title: 'Reviewed', className: 'bg-blue-100 text-blue-800' },
  { id: 'shortlisted', title: 'Shortlisted', className: 'bg-purple-100 text-purple-800' },
  { id: 'hired', title: 'Hired', className: 'bg-green-100 text-green-800' },
  { id: 'rejected', title: 'Rejected', className: 'bg-red-100 text-red-800' }
]

const getStatusBadge = (status: string) => {
  const statusConfig = {
    "applied": { label: "Applied", className: "bg-gray-100 text-gray-800" },
    "reviewed": { label: "Reviewed", className: "bg-blue-100 text-blue-800" },
    "shortlisted": { label: "Shortlisted", className: "bg-purple-100 text-purple-800" },
    "hired": { label: "Hired", className: "bg-green-100 text-green-800" },
    "rejected": { label: "Rejected", className: "bg-red-100 text-red-800" }
  }
  return statusConfig[status as keyof typeof statusConfig] || statusConfig["applied"]
}

export default function JobApplicantsPage() {
  const params = useParams()
  const jobId = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("table")
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch job details
  const { data: jobResponse, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId,
  })

  const jobData = jobResponse?.data

  // Fetch applications for this specific job
  const { data: applicationsData, isLoading: applicationsLoading, error: applicationsError } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => applicationService.getCompanyApplications({ jobId }),
    enabled: !!jobId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      applicationService.updateApplication(applicationId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
      queryClient.invalidateQueries({ queryKey: ['company-applications'] })
      toast({ title: "Application status updated successfully" })
    },
    onError: () => {
      toast({ title: "Failed to update application status", variant: "destructive" })
    },
  })

  // Process applications data
  const applications = useMemo(() => {
    if (!applicationsData?.data) return []
    return applicationsData.data.map((app: any) => ({
      _id: app._id,
      jobId: app.jobId,
      internId: app.internId,
      status: app.status,
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }))
  }, [applicationsData])

  // Filter applications based on search term
  const filteredApplications = applications.filter((application: Application) =>
    application.internId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.internId.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group applications by status for pipeline view
  const pipelineData = useMemo(() => {
    const grouped: { [key: string]: Application[] } = {}
    STAGES.forEach(stage => {
      grouped[stage.title] = filteredApplications.filter((app: Application) => app.status === stage.id)
    })
    return grouped
  }, [filteredApplications])

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    updateStatusMutation.mutate({ applicationId, status: newStatus })
  }

  const handleViewApplication = (applicationId: string) => {
    // Navigate to the detailed application view
    window.open(`/dashboard/client/applicants/${applicationId}`, '_blank')
  }

  if (jobLoading || applicationsLoading) {
    return (
      <div className="p-6">
        <LoadingCard />
      </div>
    )
  }

  if (jobError || applicationsError) {
    return (
      <div className="p-6">
        <ErrorDisplay 
          error={jobError || applicationsError} 
          title="Failed to load job applicants" 
        />
      </div>
    )
  }

  const job = jobData

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/client/jobListings/${jobId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {job?.title || "Job"}
              </Button>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                More Actions
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export Applicants</DropdownMenuItem>
              <DropdownMenuItem>Send Bulk Email</DropdownMenuItem>
              <DropdownMenuItem>Archive All</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b">
          <Button variant="ghost" className="border-b-2 border-teal-500 text-teal-600">
            Applicants
          </Button>
          <Link href={`/dashboard/client/jobListings/${jobId}`}>
            <Button variant="ghost" className="border-b-2 border-transparent hover:border-teal-500">
              Job Details
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Applicants for {job?.title || "Job"}: {applications.length}
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Applicants"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "pipeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("pipeline")}
                className="text-xs"
              >
                Pipeline View
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="text-xs"
              >
                Table View
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No applicants yet</p>
              <p className="text-sm">This job hasn't received any applications yet.</p>
            </div>
          </div>
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Cover Letter</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application: Application) => {
                  const statusConfig = getStatusBadge(application.status)
                  return (
                    <TableRow key={application._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={application.internId.avatar || "/placeholder.svg"} 
                              alt={application.internId.name} 
                            />
                            <AvatarFallback>
                              {application.internId.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{application.internId.name}</p>
                            <p className="text-sm text-gray-500">{application.internId.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {application.coverLetter ? (
                          <span className="text-sm">
                            {application.coverLetter.length > 50 
                              ? `${application.coverLetter.substring(0, 50)}...` 
                              : application.coverLetter
                            }
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No cover letter</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {STAGES.map((stage) => (
                                <DropdownMenuItem
                                  key={stage.id}
                                  onClick={() => handleStatusUpdate(application._id, stage.id)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Move to {stage.title}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {STAGES.map((stage) => (
              <div key={stage.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{stage.title}</h3>
                  <Badge variant="outline">{pipelineData[stage.title]?.length || 0}</Badge>
                </div>
                <div className="space-y-3">
                  {pipelineData[stage.title]?.map((application: Application) => (
                    <div key={application._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={application.internId.avatar || "/placeholder.svg"} 
                            alt={application.internId.name} 
                          />
                          <AvatarFallback className="text-xs">
                            {application.internId.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{application.internId.name}</p>
                          <p className="text-xs text-gray-500 truncate">{application.internId.email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        <p>Applied on {new Date(application.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewApplication(application._id)}
                          className="text-xs text-teal-600 hover:text-teal-700 p-0 h-auto"
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {STAGES.filter(s => s.id !== application.status).map((stage) => (
                              <DropdownMenuItem
                                key={stage.id}
                                onClick={() => handleStatusUpdate(application._id, stage.id)}
                                disabled={updateStatusMutation.isPending}
                              >
                                Move to {stage.title}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}