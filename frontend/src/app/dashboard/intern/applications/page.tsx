"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Filter, MoreHorizontal, Clock, MapPin, Video, Phone, User, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useMyApplications } from "@/hooks/useApplications"
import { useMyInterviews } from "@/hooks/useInterviews"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"


export default function ApplicationsPage() {
  const { data, isLoading, error } = useMyApplications()
  const { data: interviewsData, isLoading: interviewsLoading } = useMyInterviews()
  
  // Debug logging
  console.log('Applications data:', data)
  console.log('Applications error:', error)
  console.log('Applications loading:', isLoading)
  
  // Handle different possible response structures from the backend
  const applications = (data as any)?.data || (data as any)?.applications || data || []
  const interviews = (interviewsData as any)?.data || []
  
  console.log('Processed applications:', applications)
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

      {/* Upcoming Interviews */}
      {interviews.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Calendar className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviews.filter((interview: any) => interview.status === 'scheduled').map((interview: any) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{interview.job?.title || 'Position'}</h4>
                      <p className="text-sm text-gray-600">{interview.company?.name || 'Company'}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(interview.scheduledDate).toLocaleDateString()} at {new Date(interview.scheduledDate).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {interview.interviewer?.name || 'Interviewer'}
                        </span>
                        <span className="flex items-center gap-1">
                          {interview.type === 'video' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                          {interview.type?.charAt(0).toUpperCase() + interview.type?.slice(1) || 'Interview'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-700">
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </Badge>
                    {interview.meetingLink && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              {/* Enhanced Application Cards */}
              <div className="space-y-4 mt-4">
                {applications.map((app: any, idx: number) => {
                  // Handle the new data structure from backend
                  const job = app.job || {}
                  const company = job.company || {}
                  const companyName = company.name || "Company"
                  const jobTitle = job.title || "Position"
                  const applicationDate = app.createdAt || app.appliedAt || app.dateApplied
                  const status = app.status || "applied"
                  
                  // Check if there's an interview for this application
                  const relatedInterview = interviews.find((interview: any) => 
                    interview.applicationId === app._id || 
                    (interview.job?.title === jobTitle && interview.company?.name === companyName)
                  )
                  
                  // Status styling and icons
                  const getStatusInfo = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'hired':
                        return { 
                          style: "bg-green-100 text-green-700 border-green-200", 
                          icon: CheckCircle, 
                          color: "text-green-600" 
                        }
                      case 'rejected':
                        return { 
                          style: "bg-red-100 text-red-700 border-red-200", 
                          icon: XCircle, 
                          color: "text-red-600" 
                        }
                      case 'shortlisted':
                        return { 
                          style: "bg-blue-100 text-blue-700 border-blue-200", 
                          icon: AlertCircle, 
                          color: "text-blue-600" 
                        }
                      case 'interview':
                      case 'interviewed':
                        return { 
                          style: "bg-purple-100 text-purple-700 border-purple-200", 
                          icon: Calendar, 
                          color: "text-purple-600" 
                        }
                      case 'reviewed':
                        return { 
                          style: "bg-yellow-100 text-yellow-700 border-yellow-200", 
                          icon: AlertCircle, 
                          color: "text-yellow-600" 
                        }
                      case 'applied':
                      default:
                        return { 
                          style: "bg-orange-100 text-orange-700 border-orange-200", 
                          icon: Clock, 
                          color: "text-orange-600" 
                        }
                    }
                  }

                  const statusInfo = getStatusInfo(status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <Card key={app._id || app.id || idx} className="hover:shadow-md transition-all duration-200 border-l-4" style={{ borderLeftColor: statusInfo.color.replace('text-', '') }}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-teal-100 text-teal-700">
                                {companyName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-lg">{jobTitle}</h3>
                                  <p className="text-gray-600 font-medium">{companyName}</p>
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {job.location || "Remote"}
                                  </p>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Badge className={`${statusInfo.style} border`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Badge>
                                </div>
                              </div>

                              {/* Application Details */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                <div>
                                  <span className="font-medium">Applied:</span>
                                  <p>{applicationDate ? new Date(applicationDate).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Type:</span>
                                  <p>{job.type || "Full-time"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Salary:</span>
                                  <p>{job.salary || "Not specified"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Experience:</span>
                                  <p>{job.experience || "Not specified"}</p>
                                </div>
                              </div>

                              {/* Interview Information */}
                              {relatedInterview && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-800">Interview Scheduled</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3 text-gray-500" />
                                      <span>{new Date(relatedInterview.scheduledDate).toLocaleDateString()} at {new Date(relatedInterview.scheduledDate).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3 text-gray-500" />
                                      <span>{relatedInterview.interviewer?.name || 'Interviewer'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {relatedInterview.type === 'video' ? 
                                        <Video className="h-3 w-3 text-gray-500" /> : 
                                        <Phone className="h-3 w-3 text-gray-500" />
                                      }
                                      <span>{relatedInterview.type?.charAt(0).toUpperCase() + relatedInterview.type?.slice(1) || 'Interview'}</span>
                                    </div>
                                  </div>
                                  {relatedInterview.meetingLink && (
                                    <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                                      Join Meeting
                                    </Button>
                                  )}
                                </div>
                              )}

                              {/* Status-specific messages */}
                              {status.toLowerCase() === 'interview' && !relatedInterview && (
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm text-yellow-800">Interview details will be shared soon</span>
                                  </div>
                                </div>
                              )}

                              {status.toLowerCase() === 'rejected' && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <div className="flex items-center space-x-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-red-800">Unfortunately, this application was not successful</span>
                                  </div>
                                </div>
                              )}

                              {status.toLowerCase() === 'hired' && (
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-800">Congratulations! You've been selected for this position</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
