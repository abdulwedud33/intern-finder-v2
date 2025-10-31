"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  RefreshCw,
  Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { applicationService } from "@/services/applicationService"
import { reviewService } from "@/services/reviewService"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { getUserProfileUrl } from "@/utils/imageUtils"

export default function JobApplicantDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const applicantId = params.applicantId as string
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch application details
  const { data: applicationResponse, isLoading, error } = useQuery({
    queryKey: ['application', applicantId],
    queryFn: () => applicationService.getApplication(applicantId),
    enabled: !!applicantId,
  })

  const application = applicationResponse?.data

  // Extract user ID for reviews
  const userId = application?.internId?._id || application?.internId

  // Fetch reviews for this user
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviewsForTarget', userId],
    queryFn: () => reviewService.getReviewsForTarget(userId, 'all'),
    enabled: !!userId && userId !== 'no-user' && userId !== 'temp',
  })

  // Transform application data into applicant format
  const applicantData = useMemo(() => {
    if (!application) return null

    const intern = application.internId
    const job = application.jobId

    return {
      id: intern?._id || intern,
      name: intern?.name || 'Unknown',
      email: intern?.email || '',
      avatar: intern?.avatar || '/placeholder.svg',
      role: intern?.role || 'Intern',
      location: intern?.location || intern?.address || '',
      phone: intern?.phone || '',
      bio: intern?.aboutMe || intern?.about || '',
      rating: 4.5, // Default rating
      matchScore: 85, // Default match score
      status: application.status,
      appliedDate: application.createdAt,
      coverLetter: application.coverLetter,
      resume: application.resume,
      jobTitle: job?.title || 'Position',
      companyName: job?.companyId?.name || job?.companyName || 'Company',
      personalInfo: {
        email: intern?.email || '',
        phone: intern?.phone || '',
        location: intern?.location || intern?.address || '',
        website: intern?.website || intern?.portfolio || '',
        linkedin: intern?.social?.linkedin || '',
        github: intern?.social?.github || '',
        portfolio: intern?.portfolio || intern?.website || ''
      },
      professionalInfo: {
        aboutMe: intern?.aboutMe || intern?.about || '',
        experience: intern?.experience || [],
        currentJob: intern?.currentJob || '',
        experienceYears: intern?.experienceYears || '',
        education: intern?.education || '',
        skills: intern?.skills || [],
        portfolio: intern?.portfolio || '',
        documents: intern?.documents || []
      },
      applicationHistory: [
        {
          date: application.createdAt,
          action: 'Applied',
          status: 'completed',
          description: `Applied for ${job?.title} position`
        }
      ]
    }
  }, [application])

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      applicationService.updateApplication(applicationId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicantId] })
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
      toast({ title: "Application status updated successfully" })
    },
    onError: () => {
      toast({ title: "Failed to update application status", variant: "destructive" })
    },
  })

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

  const getStageProgress = (status: string) => {
    const stages = ['applied', 'reviewed', 'shortlisted', 'hired']
    const currentStageIndex = stages.indexOf(status)
    return currentStageIndex >= 0 ? ((currentStageIndex + 1) / stages.length) * 100 : 0
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingCard />
      </div>
    )
  }

  if (error || !applicantData) {
    return (
      <div className="p-6">
        <ErrorDisplay 
          error={error} 
          title="Applicant Not Found" 
          description="The applicant you're looking for doesn't exist or you don't have permission to view it."
        />
      </div>
    )
  }

  const statusConfig = getStatusBadge(applicantData.status)
  const progressPercentage = getStageProgress(applicantData.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/client/jobListings/${jobId}/applicants`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Applicants
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {applicantData.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {applicantData.jobTitle} at {applicantData.companyName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
              
              <Select
                value={applicantData.status}
                onValueChange={(value) => updateStatusMutation.mutate({ 
                  applicationId: applicantId, 
                  status: value 
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Application Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Applied</span>
            <span>Reviewed</span>
            <span>Shortlisted</span>
            <span>Hired</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Applicant Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={getUserProfileUrl(applicantData.avatar)} alt={applicantData.name} />
                    <AvatarFallback>
                      {applicantData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{applicantData.name}</h2>
                    <p className="text-gray-600">{applicantData.email}</p>
                    <p className="text-sm text-gray-500">{applicantData.location}</p>
                    {applicantData.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{applicantData.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {applicantData.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700">{applicantData.bio}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicantData.personalInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{applicantData.personalInfo.email}</span>
                    </div>
                  )}
                  {applicantData.personalInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{applicantData.personalInfo.phone}</span>
                    </div>
                  )}
                  {applicantData.personalInfo.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{applicantData.personalInfo.location}</span>
                    </div>
                  )}
                  {applicantData.personalInfo.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={applicantData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(applicantData.personalInfo.linkedin || applicantData.personalInfo.github) && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Social Links</h3>
                    <div className="flex gap-3">
                      {applicantData.personalInfo.linkedin && (
                        <a href={applicantData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {applicantData.personalInfo.github && (
                        <a href={applicantData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:underline">
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {applicantData.professionalInfo.skills.map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {typeof skill === 'string' ? skill : skill.name || skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Experience</p>
                  {Array.isArray(applicantData.professionalInfo.experience) && applicantData.professionalInfo.experience.length > 0 ? (
                    <div className="space-y-3">
                      {applicantData.professionalInfo.experience.map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{exp.title || exp.position || 'Position'}</h4>
                            <span className="text-xs text-gray-500">
                              {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{exp.company || exp.organization || 'Company'}</p>
                          {exp.location && (
                            <p className="text-xs text-gray-500">{exp.location}</p>
                          )}
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {typeof applicantData.professionalInfo.experience === 'string' 
                        ? applicantData.professionalInfo.experience 
                        : 'No experience listed'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Education</p>
                  <p className="text-sm text-gray-700">{applicantData.professionalInfo.education || 'No education listed'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {applicantData.coverLetter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{applicantData.coverLetter}</p>
                </CardContent>
              </Card>
            )}

            {/* Resume Preview */}
            {applicantData.resume && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full border rounded-md overflow-hidden">
                    <iframe
                      src={`${applicantData.resume}`}
                      className="w-full h-[600px]"
                      title="Resume Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Applied</span>
                  <span className="text-sm font-medium">
                    {new Date(applicantData.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Position</span>
                  <span className="text-sm font-medium">{applicantData.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
                {applicantData.matchScore && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Match Score</span>
                    <span className="text-sm font-medium">{applicantData.matchScore}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {applicantData.resume && (
                  <a href={applicantData.resume} target="_blank" rel="noopener noreferrer" className="w-full inline-flex">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start">
                      <span>
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </span>
                    </Button>
                  </a>
                )}
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
