"use client"

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Users,
  UserCheck,
  UserX,
  Star,
  TrendingUp
} from 'lucide-react'
import { useCompanyInterns, useCompanyInternStats, useUpdateInternStatus, useTerminateIntern } from '@/hooks/useCompanyInterns'
import { CompanyInternStatsComponent } from '@/components/company-interns/CompanyInternStats'
import { CompanyInternTable } from '@/components/company-interns/CompanyInternTable'
import { LoadingCard } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-boundary'

export default function CompanyInternsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Fetch data
  const { data: internsData, isLoading: isLoadingInterns, error: internsError } = useCompanyInterns({
    page: currentPage,
    limit: pageSize,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    search: searchQuery || undefined,
    sortBy,
    sortOrder
  })

  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useCompanyInternStats()
  const updateStatusMutation = useUpdateInternStatus()
  const terminateMutation = useTerminateIntern()

  const interns = internsData?.data || []
  const stats = statsData?.data

  // Filter and sort interns locally for better UX
  const filteredInterns = useMemo(() => {
    let filtered = [...interns]

    if (searchQuery) {
      filtered = filtered.filter(intern =>
        intern.intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.job.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(intern => intern.status === statusFilter)
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(intern => intern.job.department === departmentFilter)
    }

    return filtered
  }, [interns, searchQuery, statusFilter, departmentFilter])

  const handleStatusUpdate = async (internId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        internId,
        data: { status: status as any }
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleTerminate = async (internId: string) => {
    try {
      await terminateMutation.mutateAsync({
        internId,
        data: {
          reason: 'Terminated by company',
          endDate: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to terminate intern:', error)
    }
  }

  const handlePerformanceReview = (internId: string) => {
    // This will be handled by the dialog component
    console.log('Performance review for intern:', internId)
  }

  if (isLoadingInterns || isLoadingStats) {
    return <LoadingCard />
  }

  if (internsError || statsError) {
    return <ErrorDisplay error={internsError || statsError} />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intern Management</h1>
          <p className="text-gray-600 mt-1">Manage your company's interns and track their performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Intern
          </Button>
        </div>
      </div>

      {/* Stats */}
      <CompanyInternStatsComponent stats={stats} isLoading={isLoadingStats} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Interns</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="terminated">Terminated</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>All Interns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or job title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-')
                    setSortBy(field)
                    setSortOrder(order as 'asc' | 'desc')
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                      <SelectItem value="startDate-desc">Newest First</SelectItem>
                      <SelectItem value="startDate-asc">Oldest First</SelectItem>
                      <SelectItem value="rating-desc">Highest Rating</SelectItem>
                      <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <CompanyInternTable
                interns={filteredInterns}
                onStatusUpdate={handleStatusUpdate}
                onTerminate={handleTerminate}
                onPerformanceReview={handlePerformanceReview}
                isLoading={isLoadingInterns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Active Interns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyInternTable
                interns={filteredInterns.filter(intern => intern.status === 'active')}
                onStatusUpdate={handleStatusUpdate}
                onTerminate={handleTerminate}
                onPerformanceReview={handlePerformanceReview}
                isLoading={isLoadingInterns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Completed Internships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyInternTable
                interns={filteredInterns.filter(intern => intern.status === 'completed')}
                onStatusUpdate={handleStatusUpdate}
                onTerminate={handleTerminate}
                onPerformanceReview={handlePerformanceReview}
                isLoading={isLoadingInterns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Terminated Interns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyInternTable
                interns={filteredInterns.filter(intern => intern.status === 'terminated')}
                onStatusUpdate={handleStatusUpdate}
                onTerminate={handleTerminate}
                onPerformanceReview={handlePerformanceReview}
                isLoading={isLoadingInterns}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
