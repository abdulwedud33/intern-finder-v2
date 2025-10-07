"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreHorizontal, Filter, Calendar, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useCompanyJobs, useDeleteJob, useCloseJob } from "@/hooks/useJobManagement"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { useToast } from "@/components/ui/use-toast"

export default function JobListingsPage() {
  const { data, isLoading, error } = useCompanyJobs()
  const deleteJobMutation = useDeleteJob()
  const closeJobMutation = useCloseJob()
  const { toast } = useToast()
  
  // Backend now handles filtering, so we just use the data directly
  const jobs = Array.isArray(data?.data?.jobs) ? data.data.jobs : []
  
  // Debug logging to help identify issues
  console.log('JobListingsPage - data:', data)
  console.log('JobListingsPage - jobs:', jobs)
  
  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast({
          title: "Job deleted successfully",
          description: "The job listing has been removed.",
        });
      },
      onError: () => {
        toast({
          title: "Failed to delete job",
          description: "Please try again later.",
          variant: "destructive",
        });
      },
    });
  }

  const handleCloseJob = (jobId: string) => {
    closeJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast({
          title: "Job closed successfully",
          description: "The job listing is now closed to new applications.",
        });
      },
      onError: () => {
        toast({
          title: "Failed to close job",
          description: "Please try again later.",
          variant: "destructive",
        });
      },
    });
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold m-2 text-gray-900">Job Listing</h1>
          <p className="text-gray-600">Here is your job listing status from July 19 - July 25.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md p-2 gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Jul 19 - Jul 25</span>
          </div>
        </div>
      </div>

      {/* Job List Section */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Job List</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Link href="/dashboard/client/jobListings/new">
                <Button className="bg-teal-500 hover:bg-teal-600">Create New Job</Button>
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingCard />
        ) : error ? (
          <ErrorDisplay error={error} title="Failed to load job listings" />
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No job listings found. Create your first job posting!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead>Application Deadline</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs && jobs.length > 0 ? jobs.map((job: any) => (
              <TableRow key={job._id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>
                  <Badge className={
                    job.status === "published" 
                      ? "bg-green-100 text-green-800" 
                      : job.status === "closed"
                      ? "bg-red-100 text-red-800"
                      : job.status === "filled"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {job.status || "draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-gray-600">
                  {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{job.type || "—"}</Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {job.isRemote ? "Remote" : job.location || "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/jobs/${job._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Job
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/client/jobListings/${job._id}/applicants`}>
                          View Applicants
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/client/jobListings/${job._id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Job
                        </Link>
                      </DropdownMenuItem>
                      {job.status === "published" && (
                        <DropdownMenuItem onClick={() => handleCloseJob(job._id)}>
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
                              onClick={() => handleDeleteJob(job._id)}
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
                </TableCell>
              </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No jobs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-teal-600">
              <span>View</span>
              <select className="border rounded px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>Applicants per page</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                &lt;
              </Button>
              <Button variant="default" className="bg-teal-500 text-white" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                &gt;
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
