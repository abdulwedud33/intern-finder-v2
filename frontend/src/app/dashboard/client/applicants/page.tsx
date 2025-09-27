"use client"

import { useState, useCallback, useMemo } from "react"
import { Search, MoreHorizontal, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCompanyApplications, updateApplication, scheduleInterview } from "@/services/applicationsService"
import { toast } from "sonner"
import { format } from "date-fns"

// Types
type Application = {
  id: string
  listingId: string
  internId: string
  stage: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
  score?: number
  appliedAt: string
  updatedAt: string
  listing: {
    id: string
    title: string
    company: string
  }
  intern: {
    id: string
    name: string
    email: string
    profile?: {
      avatar?: string
    }
  }
}

type Stage = {
  id: Application['stage']
  title: string
  className: string
}

const STAGES: Stage[] = [
  { id: 'pending', title: 'Pending', className: 'bg-gray-100' },
  { id: 'reviewing', title: 'Reviewing', className: 'bg-blue-100' },
  { id: 'interview', title: 'Interview', className: 'bg-purple-100' },
  { id: 'accepted', title: 'Accepted', className: 'bg-green-100' },
  { id: 'rejected', title: 'Rejected', className: 'bg-red-100' }
]

// Application Card Component
function ApplicationCard({ application, onAction }: { application: Application; onAction: (action: string, application: Application) => void }) {
  const status = STAGES.find(s => s.id === application.stage) || STAGES[0]
  const internName = application.intern?.name || 'Unknown Applicant';
  const initials = internName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={application.intern?.profile?.avatar} alt={internName} />
              <AvatarFallback>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{internName}</h4>
              <p className="text-sm text-gray-500">
                {application.listing?.title || 'Position'} at {application.listing?.company || 'Company'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction('view', application)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('schedule', application)}>
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('decline', application)} className="text-red-600">
                Decline Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <Badge className={status.className}>
            {status.title}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            {application.score || 'N/A'}
          </div>
        </div>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date and Time</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={format(date, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setDate(new Date(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              placeholder="Add any notes about the interview..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isScheduling}>
              {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Main component
export default function ApplicantsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("table")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch applications
  const {
    data: applicationsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["company-applications", { search: searchTerm, ...pagination }],
    queryFn: () => getCompanyApplications({
      search: searchTerm,
      page: pagination.page,
      limit: pagination.pageSize
    } as Record<string, unknown>),
    staleTime: 0
  })

  const applications = useMemo(() => {
    const data = (applicationsData as any)?.data || [];
    // Ensure each application has a properly structured intern object
    return data.map((app: any) => ({
      ...app,
      intern: {
        id: app.intern?.id || '',
        name: app.intern?.name || 'Unknown',
        email: app.intern?.email || '',
        profile: app.intern?.profile || {}
      },
      listing: app.listing || {
        id: '',
        title: 'Unknown Listing',
        company: 'Unknown Company'
      }
    }));
  }, [applicationsData])
  const totalItems = (applicationsData as any)?.pagination?.total || 0
  const totalPages = Math.ceil(totalItems / pagination.pageSize)

  // Mutations
  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => 
      updateApplication(id, { stage } as { stage: string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-applications'] })
      toast.success('Application updated successfully')
    },
    onError: () => {
      toast.error('Failed to update application')
    }
  })

  const scheduleInterviewMutation = useMutation({
    mutationFn: ({ id, date, note }: { id: string; date: Date; note: string }) =>
      scheduleInterview(id, { 
        date: date.toISOString(), 
        time: format(date, 'HH:mm'),
        type: 'video',
        notes: note 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-applications'] })
      toast.success('Interview scheduled successfully')
    },
    onError: () => {
      toast.error('Failed to schedule interview')
    }
  })

  // Handlers
  const handleAction = (action: string, application: Application) => {
    switch (action) {
      case 'view':
        window.open(`/dashboard/client/applicants/${application.id}`, '_blank')
        break
      case 'schedule':
        setSelectedApplication(application)
        setIsInterviewModalOpen(true)
        break
      case 'decline':
        if (window.confirm('Are you sure you want to decline this application?')) {
          updateStageMutation.mutate({ id: application.id, stage: 'rejected' })
        }
        break
    }
  }

  const handleScheduleInterview = async (data: { date: Date; note: string }) => {
    if (!selectedApplication) return
    await scheduleInterviewMutation.mutateAsync({
      id: selectedApplication.id,
      ...data
    })
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="p-6">
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
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading applications</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load applications. Please try again later.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="rounded-md bg-red-50 text-sm font-medium text-red-800 hover:bg-red-100"
                  onClick={() => queryClient.refetchQueries({ queryKey: ['company-applications'] })}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {totalItems} Applicant{totalItems !== 1 ? 's' : ''}
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
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
      {viewMode === 'pipeline' ? (
        // Pipeline View
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageApplications = applications.filter((app: Application) => app.stage === stage.id)
              return (
                <div key={stage.id} className="w-72 flex-shrink-0">
                  <div className={`p-3 rounded-t-lg ${stage.className} bg-opacity-20`}>
                    <h3 className="font-medium">{stage.title}</h3>
                    <span className="text-xs opacity-70">{stageApplications.length} applicant{stageApplications.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-b-lg h-[calc(100vh-250px)] overflow-y-auto">
                    {stageApplications.map((application: Application) => (
                      <div key={application.id} className="mb-2">
                        <ApplicationCard 
                          application={application} 
                          onAction={handleAction} 
                        />
                      </div>
                    ))}
                    {stageApplications.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-4">
                        No applications in this stage
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[250px]">Candidate</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application: Application) => {
                const status = STAGES.find(s => s.id === application.stage) || STAGES[0]
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={application.intern.profile?.avatar} alt={application.intern.name} />
                          <AvatarFallback>
                            {application.intern.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{application.intern.name}</div>
                          <div className="text-sm text-gray-500">{application.intern.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{application.score || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>
                        {status.title}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {application.listing.title}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction('view', application)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('schedule', application)}>
                            Schedule Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAction('decline', application)} 
                            className="text-red-600"
                          >
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
          
          {applications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No applications found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.pageSize, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show current page and 2 pages before and after
              let pageNum = i + 1
              if (pagination.page > 3 && pagination.page < totalPages - 1) {
                pageNum = pagination.page - 2 + i
              } else if (pagination.page >= totalPages - 1) {
                pageNum = Math.max(1, totalPages - 4) + i
              }
              
              if (pageNum > totalPages) return null
              
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Interview Modal */}
      <ScheduleInterviewModal
        applicationId={selectedApplication?.id || ''}
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false)
          setSelectedApplication(null)
        }}
        onSchedule={handleScheduleInterview}
      />
    </div>
  )
}
