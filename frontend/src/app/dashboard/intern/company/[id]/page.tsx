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
  Facebook
} from "lucide-react"
import { useCompanyById } from "@/hooks/useCompanies"
import { useJobsByCompany } from "@/hooks/useJobs"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getImageUrl } from "@/utils/imageUtils"

// Helper function to clean URL prefixes
const cleanUrl = (url: string): string => {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

interface CompanyDetailPageProps {
  params: { id: string }
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const router = useRouter()
  const { company, loading, error } = useCompanyById(params.id)
  
  // Get jobs from this company
  const { jobs: companyJobs, loading: jobsLoading } = useJobsByCompany(params.id, { 
    limit: 6
  })

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
              Back
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={getImageUrl(company.logo) || ""} alt={`${company.name} Logo`} />
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
                        <p className="font-medium">{company.companySize} employees</p>
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
                          {cleanUrl(company.website)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {company.contact && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.contact.phone && (
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
                          <p className="font-medium">{company.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {company.contact.address && (
                      <div className="flex items-center gap-3 md:col-span-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{company.contact.address}</p>
                          {company.contact.city && company.contact.state && (
                            <p className="text-sm text-gray-600">
                              {company.contact.city}, {company.contact.state} {company.contact.zipCode}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {(company.socialMedia || company.social) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap">
                    {/* Check both social structures */}
                    {(company.socialMedia?.linkedin || company.social?.linkedin) && (
                      <a 
                        href={company.socialMedia?.linkedin || company.social?.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Linkedin className="h-5 w-5" />
                        {cleanUrl(company.socialMedia?.linkedin || company.social?.linkedin || '')}
                      </a>
                    )}
                    {company.socialMedia?.twitter && (
                      <a 
                        href={company.socialMedia.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-500"
                      >
                        <Twitter className="h-5 w-5" />
                        {cleanUrl(company.socialMedia.twitter)}
                      </a>
                    )}
                    {company.socialMedia?.facebook && (
                      <a 
                        href={company.socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="h-5 w-5" />
                        {cleanUrl(company.socialMedia.facebook)}
                      </a>
                    )}
                    {(company.socialMedia?.github || company.social?.github) && (
                      <a 
                        href={company.socialMedia?.github || company.social?.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-800 hover:text-gray-900"
                      >
                        <Globe className="h-5 w-5" />
                        {cleanUrl(company.socialMedia?.github || company.social?.github || '')}
                      </a>
                    )}
                    {(company.socialMedia?.website || company.social?.portfolio) && (
                      <a 
                        href={company.socialMedia?.website || company.social?.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        <Globe className="h-5 w-5" />
                        {cleanUrl(company.socialMedia?.website || company.social?.portfolio || '')}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href={`/jobs?company=${company.name}`}>
                    View All Jobs
                  </Link>
                </Button>
                {company.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Company Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Jobs</span>
                  <Badge variant="secondary">{companyJobs.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Company Size</span>
                  <span className="font-medium">{company.companySize || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="font-medium">{company.industry || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Founded</span>
                  <span className="font-medium">
                    {company.createdAt ? new Date(company.createdAt).getFullYear() : "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Jobs from this Company */}
        {companyJobs.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Jobs from {company.name}
              </h2>
              <Button variant="outline" asChild>
                <Link href={`/jobs?company=${company.name}`}>
                  View All Jobs
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyJobs.slice(0, 6).map((job: any) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getImageUrl(job.company?.logo) || ""} alt={`${job.company?.name} Logo`} />
                          <AvatarFallback>
                            {job.company?.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company?.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {job.type || "Full-time"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.isRemote ? "Remote" : job.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
                      </div>
                    </div>
                    
                    <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                      <Link href={`/jobs/${job._id}`}>
                        View Job
                      </Link>
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
