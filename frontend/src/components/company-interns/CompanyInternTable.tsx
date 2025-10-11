"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserAvatarUrl } from '@/utils/imageUtils'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreHorizontal, 
  Edit, 
  UserCheck, 
  UserX, 
  UserMinus,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Eye,
  Users
} from 'lucide-react'
import { CompanyIntern } from '@/services/companyInternService'
import { format } from 'date-fns'
import { CompanyInternStatusDialog } from './CompanyInternStatusDialog'
import { CompanyInternTerminateDialog } from './CompanyInternTerminateDialog'
import { CompanyInternPerformanceDialog } from './CompanyInternPerformanceDialog'

interface CompanyInternTableProps {
  interns: CompanyIntern[]
  onStatusUpdate?: (internId: string, status: string) => void
  onTerminate?: (internId: string) => void
  onPerformanceReview?: (internId: string) => void
  isLoading?: boolean
}

export function CompanyInternTable({
  interns,
  onStatusUpdate,
  onTerminate,
  onPerformanceReview,
  isLoading = false
}: CompanyInternTableProps) {
  const [selectedIntern, setSelectedIntern] = useState<CompanyIntern | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleStatusUpdate = (intern: CompanyIntern) => {
    setSelectedIntern(intern)
    setStatusDialogOpen(true)
  }

  const handleTerminate = (intern: CompanyIntern) => {
    setSelectedIntern(intern)
    setTerminateDialogOpen(true)
  }

  const handlePerformanceReview = (intern: CompanyIntern) => {
    setSelectedIntern(intern)
    setPerformanceDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (interns.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No interns found</h3>
        <p className="text-gray-500">No interns have been assigned to your company yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intern</TableHead>
              <TableHead>Job Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interns.map((intern) => (
              <TableRow key={intern._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserAvatarUrl({...intern.intern, role: 'intern'})} />
                      <AvatarFallback>
                        {intern.intern.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{intern.intern.name}</div>
                      <div className="text-sm text-gray-500">{intern.intern.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{intern.job.title}</div>
                    <div className="text-sm text-gray-500">{intern.job.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{intern.job.department}</Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(intern.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{format(new Date(intern.startDate), 'MMM dd, yyyy')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {intern.performance ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{intern.performance.rating}/5</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(intern.performance.lastReview), 'MMM dd')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No rating</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePerformanceReview(intern)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(intern)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePerformanceReview(intern)}>
                        <Star className="h-4 w-4 mr-2" />
                        Performance Review
                      </DropdownMenuItem>
                      {intern.status !== 'terminated' && (
                        <DropdownMenuItem 
                          onClick={() => handleTerminate(intern)}
                          className="text-red-600"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Terminate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Status Update Dialog */}
      <CompanyInternStatusDialog
        intern={selectedIntern}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onStatusUpdate={onStatusUpdate}
      />

      {/* Terminate Dialog */}
      <CompanyInternTerminateDialog
        intern={selectedIntern}
        open={terminateDialogOpen}
        onOpenChange={setTerminateDialogOpen}
        onTerminate={onTerminate}
      />

      {/* Performance Review Dialog */}
      <CompanyInternPerformanceDialog
        intern={selectedIntern}
        open={performanceDialogOpen}
        onOpenChange={setPerformanceDialogOpen}
        onPerformanceReview={onPerformanceReview}
      />
    </>
  )
}
