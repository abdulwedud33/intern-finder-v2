"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, Share2, Heart, Briefcase, User, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useJobById, type Job } from "@/hooks/useJobs"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { job, loading, error } = useJobById(resolvedParams.id)
  const { user } = useAuth()

  // Debug: Log job data to see what's available
  console.log('Job data:', job)
  console.log('Company ID:', job?.companyId)
  console.log('Company object:', job?.company)
  console.log('Company _id:', job?.company?._id)

  // Check if user is an intern
  const isIntern = user?.role === 'intern'

  // Helper function to validate and format logo URL
  const getValidLogoUrl = (logoUrl: string | undefined) => {
    if (!logoUrl || logoUrl === "no-logo.jpg") {
      return "/placeholder.svg?height=80&width=80&text=CO"
    }
    // If it's already a full URL, return as is
    if (logoUrl.startsWith("http")) {
      return logoUrl
    }
    // If it already starts with /uploads/, just prepend the API URL
    if (logoUrl.startsWith("/uploads/")) {
      const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://intern-finder-backend-v2.onrender.com';
      return `${API_URL}${logoUrl}`
    }
    // Otherwise, construct the full URL
    const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://intern-finder-backend-v2.onrender.com';
    return `${API_URL}/uploads/${logoUrl}`
  }

  // Type guard to check if job has the expected properties
  const isJobValid = (job: any): job is Job => {
    return job && typeof job === 'object' && '_id' in job
  }

  const handleApply = () => {
    if (!user) {
      toast({
        title: "🔐 Login Required",
        description: "Please log in to apply for this job.",
        variant: "destructive",
        duration: 5000,
      });
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    
    if (!isIntern) {
      toast({
        title: "🚫 Access Denied",
        description: "Only interns can apply to jobs. Please log in with an intern account.",
        variant: "destructive",
        duration: 5000,
      });
      return
    }
    
    // Navigate to application page
    router.push(`/jobs/${resolvedParams.id}/apply`)
  }

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage error={{ message: error.toString() }} />
  if (!job || !isJobValid(job)) return <ErrorPage error={{ message: 'Job not found' }} />

  return (
    <div className="bg-gray-50 min-h-screen mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center shadow-sm">
                    {job.company?.logo ? (
                      <Image
                        src={getValidLogoUrl(job.company.logo)}
                        alt={`${job.company.name} logo`}
                        width={64}
                        height={64}
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="text-xl font-bold text-teal-600">
                        {job.company?.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <Link 
                      href={`/jobs/${resolvedParams.id}/${job.companyId || job.company?._id || 'no-company'}`}
                      className="text-lg text-teal-600 hover:text-teal-700 transition-colors duration-200 font-medium"
                    >
                      {job.company?.name || job.companyName || 'Company'}
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{job.isRemote ? 'Remote' : job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span className="capitalize">{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-green-600">
                          {job.salary 
                            ? (typeof job.salary === 'string' 
                              ? job.salary 
                              : `$${job.salary?.min?.toLocaleString()} - $${job.salary?.max?.toLocaleString()} ${job.salary?.currency || ''}`)
                            : 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description Card */}
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">{job.description || 'No description provided.'}</p>
                          
                  {job.responsibilities && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                        Responsibilities
                      </h3>
                      {Array.isArray(job.responsibilities) ? (
                        <ul className="space-y-3">
                          {job.responsibilities.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.responsibilities}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {job.requirements && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Requirements
                      </h3>
                      {Array.isArray(job.requirements) ? (
                        <ul className="space-y-3">
                          {job.requirements.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.requirements}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Apply?</h3>
                  <p className="text-sm text-gray-600">Join our team and start your career journey</p>
                </div>
                
                {!user ? (
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 mb-3 shadow-lg" 
                    onClick={handleApply}
                  >
                    Login to Apply
                  </Button>
                ) : isIntern ? (
                  <Button size="lg" className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 mb-3 shadow-lg" asChild>
                    <Link href={`/jobs/${resolvedParams.id}/apply`}>Apply Now</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-gray-400 text-white font-semibold py-3 mb-3" disabled>
                    Intern Access Only
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: job.title,
                          text: `Check out this job: ${job.title} at ${job.company?.name}`,
                          url: window.location.href,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: 'Link copied to clipboard!',
                          description: 'Share this job with others!',
                        });
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Overview Card */}
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Job Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{job.type || 'Full-time'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">{job.isRemote ? 'Remote' : job.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Salary</p>
                        <p className="font-semibold text-gray-900">
                          {job.salary 
                            ? (typeof job.salary === 'string' 
                              ? job.salary 
                              : `$${job.salary?.min?.toLocaleString()} - $${job.salary?.max?.toLocaleString()} ${job.salary?.currency || ''}`)
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience Level</p>
                        <p className="font-semibold text-gray-900 capitalize">{job.level || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {job.deadline && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Application Deadline</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(job.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>

      </div>
    </div>
  )
}
