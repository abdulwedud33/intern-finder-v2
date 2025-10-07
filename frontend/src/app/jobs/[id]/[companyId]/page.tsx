"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Building, 
  MapPin, 
  Users, 
  Globe, 
  Mail, 
  Phone, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Linkedin,
  Twitter,
  Facebook,
  Briefcase,
  DollarSign,
  Clock
} from "lucide-react"
import { useCompanyById } from "@/hooks/useCompanies"
import { useJobs } from "@/hooks/useJobs"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

interface CompanyDetailPageProps {
  params: { 
    id: string
    companyId: string 
  }
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { company, loading, error } = useCompanyById(params.companyId)
  
  // Get jobs from this company
  const { jobs: companyJobs } = useJobs({ 
    limit: 6,
  })

  // Filter jobs by this company
  const filteredJobs = companyJobs.filter(job => job.company?._id === params.companyId)

  // Check if user is an intern
  const isIntern = user?.role === 'intern'

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage error={{ message: error.toString() }} />
  if (!company) return <ErrorPage error={{ message: 'Company not found' }} />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={company.logo || ""} alt={`${company.name} Logo`} />
                <AvatarFallback className="text-xl">
                  {company.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.industry || "Company"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {company.description || "No description available for this company."}
                </p>
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.industry && (
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium">{company.industry}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.companySize && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Company Size</p>
                        <p className="font-medium">{company.companySize}</p>
                      </div>
                    </div>
                  )}

                  {company.headquarters && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Headquarters</p>
                        <p className="font-medium">{company.headquarters}</p>
                      </div>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {company.contact?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{company.contact.phone}</p>
                      </div>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a 
                          href={`mailto:${company.email}`}
                          className="font-medium text-teal-600 hover:text-teal-700"
                        >
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            {company.socialMedia && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {company.socialMedia.linkedin && (
                      <a
                        href={company.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        LinkedIn
                      </a>
                    )}
                    {company.socialMedia.twitter && (
                      <a
                        href={company.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                        Twitter
                      </a>
                    )}
                    {company.socialMedia.facebook && (
                      <a
                        href={company.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                        Facebook
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                {isIntern ? (
                  <Button 
                    size="lg" 
                    className="w-full bg-teal-600 hover:bg-teal-700 mb-4" 
                    asChild
                  >
                    <Link href={`/dashboard/intern/company/${company._id}`}>
                      View Full Company Profile
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-full bg-gray-400 text-white mb-4" 
                    disabled
                  >
                    Login as Intern for Full Access
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Back to Job
                </Button>
              </CardContent>
            </Card>

            {/* Company Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">{filteredJobs.length}</p>
                  <p className="text-sm text-gray-500">Active Jobs</p>
                </div>
                {company.companySize && (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{company.companySize}</p>
                    <p className="text-sm text-gray-500">Company Size</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Jobs */}
        {filteredJobs.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Jobs at {company.name}</h2>
              <Link 
                href={`/jobs?company=${company._id}`}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                View All Jobs
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.slice(0, 6).map((job: any) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {job.company?.logo ? (
                            <Image
                              src={job.company.logo}
                              alt={`${job.company.name} logo`}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <Building className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company?.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{job.type || "Full-time"}</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {job.isRemote ? "Remote" : job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {job.createdAt ? new Date(job.createdAt).toDateString() : "Recently"}
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <DollarSign className="h-4 w-4" />
                          {typeof job.salary === 'string' 
                            ? job.salary 
                            : `${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}`}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full" 
                      asChild
                    >
                      <Link href={`/jobs/${job._id}`}>View Job</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
