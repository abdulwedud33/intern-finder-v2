"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Eye, Users, Calendar, MapPin, DollarSign, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { jobService } from "@/services/jobService"
import { useDeleteJob, useCloseJob } from "@/hooks/useJobManagement"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"

type JobDetailsPageProps = {
  params: {
    id: string
  }
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const jobId = params.id

  // Fetch job details
  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId,
  })

  const job = jobData?.data

  const deleteJobMutation = useDeleteJob()
  const closeJobMutation = useCloseJob()

  const handleDeleteJob = () => {
    deleteJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast({
          title: "Job deleted successfully",
          description: "The job listing has been removed.",
        })
        // Redirect to job listings
        window.location.href = "/dashboard/client/jobListings"
      },
      onError: () => {
        toast({
          title: "Failed to delete job",
          description: "Please try again later.",
          variant: "destructive",
        })
      },
    })
  }

  const handleCloseJob = () => {
    closeJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast({
          title: "Job closed successfully",
          description: "The job listing is now closed to new applications.",
        })
        queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      },
      onError: () => {
        toast({
          title: "Failed to close job",
          description: "Please try again later.",
          variant: "destructive",
        })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingCard />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay error={error} title="Failed to load job details" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Job not found</p>
          <p className="text-sm">The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/client/jobListings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Listings
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600">Job Details & Management</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/client/jobListings/${jobId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/jobs/${jobId}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Job
                </Link>
              </DropdownMenuItem>
              {job.status === "active" && (
                <DropdownMenuItem onClick={handleCloseJob}>
                  Close Job
                </DropdownMenuItem>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Job
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Job Listing</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{job.title}"? This action cannot be undone and will remove all associated applications.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteJob}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleteJobMutation.isPending}
                    >
                      {deleteJobMutation.isPending ? "Deleting..." : "Delete Job"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b">
          <Link href={`/dashboard/client/jobListings/${jobId}/applicants`}>
            <Button variant="ghost" className="border-b-2 border-transparent hover:border-teal-500">
              <Users className="h-4 w-4 mr-2" />
              Applicants
            </Button>
          </Link>
          <Button variant="ghost" className="border-b-2 border-teal-500 text-teal-600">
            Job Details
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    {job.company?.name?.charAt(0) || job.title.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">
                      {job.company?.name || "Company"} • {job.type || "Full-time"} • {job.location || "Location"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={
                        job.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : job.status === "closed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }>
                        {job.status || "draft"}
                      </Badge>
                      {job.isRemote && (
                        <Badge variant="outline" className="text-blue-600">
                          Remote
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Link href={`/dashboard/client/jobListings/${jobId}/edit`}>
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </Button>
                </Link>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Job Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {job.requirements.map((requirement: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Responsibilities</h3>
                <ul className="space-y-3">
                  {job.responsibilities.map((responsibility: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Qualifications</h3>
                <ul className="space-y-3">
                  {job.qualifications.map((qualification: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{job.isRemote ? "Remote" : job.location || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Job Type</p>
                    <p className="font-medium">{job.type || "Not specified"}</p>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Salary</p>
                      <p className="font-medium">
                        {typeof job.salary === 'string' 
                          ? job.salary 
                          : `$${job.salary?.min?.toLocaleString()} - $${job.salary?.max?.toLocaleString()} ${job.salary?.currency || ''}`}
                      </p>
                    </div>
                  </div>
                )}

                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Application Deadline</p>
                      <p className="font-medium">
                        {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Posted On</p>
                    <p className="font-medium">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/dashboard/client/jobListings/${jobId}/applicants`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Applicants
                  </Button>
                </Link>
                <Link href={`/jobs/${jobId}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Job
                  </Button>
                </Link>
                <Link href={`/dashboard/client/jobListings/${jobId}/edit`} className="block">
                  <Button className="w-full justify-start bg-teal-600 hover:bg-teal-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job Details
                  </Button>
                </Link>
              </div>
            </div>

            {/* Job Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Job Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <Badge className={
                    job.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : job.status === "closed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {job.status || "draft"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remote Work</span>
                  <span className="text-sm font-medium">
                    {job.isRemote ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Experience Level</span>
                  <span className="text-sm font-medium">
                    {job.level || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}