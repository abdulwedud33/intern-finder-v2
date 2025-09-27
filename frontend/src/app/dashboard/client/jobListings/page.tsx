"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreHorizontal, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { useCompanyListings, useDeleteListing } from "@/hooks/useListings"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"

export default function JobListingsPage() {
  const { data, isLoading, error } = useCompanyListings()
  const deleteListingMutation = useDeleteListing()
  
  // Backend now handles filtering, so we just use the data directly
  const listings = data?.data || []
  
  const handleDeleteListing = (listingId: string) => {
    deleteListingMutation.mutate(listingId)
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
        ) : listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No job listings found. Create your first job posting!
            <div className="mt-4 text-xs text-gray-400">
              Debug: isLoading={String(isLoading)}, error={String(error)}, 
              dataExists={String(!!data)}, listingsCount={listings.length}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Needs</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((job: any) => (
              <TableRow key={job._id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>
                  <Badge className={job.status === "Live" || job.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {job.status || "open"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ""}</TableCell>
                <TableCell className="text-gray-600">{job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{Array.isArray(job.typesOfEmployment) ? job.typesOfEmployment.join(", ") : (job.type || "")}</Badge>
                </TableCell>
                <TableCell className="font-medium">{job.applicantsCount ?? 0}</TableCell>
                <TableCell className="text-gray-600">{job.capacity ?? 0}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/client/jobListings/${job._id}`}>View Job Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/client/jobListings/${job._id}/applicants`}>View Applicants</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Job</DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600">
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
                              onClick={() => handleDeleteListing(job._id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteListingMutation.isPending}
                            >
                              {deleteListingMutation.isPending ? "Deleting..." : "Delete Job"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              ))}
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
