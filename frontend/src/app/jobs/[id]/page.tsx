"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, Share2, Heart, Briefcase } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useJobById, useJobs, type Job } from "@/hooks/useJobs"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const RELATED_JOBS_COUNT = 3

interface JobDetailPageProps {
  params: { id: string }
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { job, loading, error } = useJobById(params.id)
  const { jobs: allJobs = [] } = useJobs({ limit: 20 })
  const { user } = useAuth()

  // Check if user is an intern
  const isIntern = user?.role === 'intern'

  // Helper function to validate and format logo URL
  const getValidLogoUrl = (logoUrl: string | undefined) => {
    if (!logoUrl || logoUrl === "no-logo.jpg" || !logoUrl.startsWith("http")) {
      return "/placeholder.svg?height=80&width=80&text=CO"
    }
    return logoUrl
  }

  // Type guard to check if job has the expected properties
  const isJobValid = (job: any): job is Job => {
    return job && typeof job === 'object' && '_id' in job
  }

  // Get related jobs from the same company (max 3)
  const getRelatedJobs = () => {
    if (!job || !allJobs.length) return []
    
    const currentJobId = job._id
    const currentCompanyId = job.company?._id
    
    // Get jobs from the same company only
    const sameCompanyJobs = allJobs
      .filter(j => j._id !== currentJobId && j.company?._id === currentCompanyId)
      .slice(0, RELATED_JOBS_COUNT)
    
    return sameCompanyJobs
  }

  const relatedJobs = getRelatedJobs()

  const handleApply = () => {
    if (!isIntern) {
      // Redirect to login or show signup modal
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    
    // TODO: Implement application submission
    toast({
      title: 'Apply for job',
      description: 'Application functionality will be implemented in the next step.',
    })
  }

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage error={{ message: error.toString() }} />
  if (!job || !isJobValid(job)) return <ErrorPage error={{ message: 'Job not found' }} />

  return (
    <div className="bg-white min-h-screen">
      {/* Top Header */}
      <div className="bg-black py-4 text-center">
        <h1 className="text-2xl font-semibold text-white">Job Details</h1>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {job.company?.logo ? (
                        <Image
                          src={getValidLogoUrl(job.company.logo)}
                          alt={`${job.company.name} logo`}
                          width={80}
                          height={80}
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">
                          {job.company?.name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">{job.title}</h1>
                      <Link 
                        href={`/jobs/${params.id}/${job.company?._id}`}
                        className="text-gray-600 hover:text-teal-600 transition-colors duration-200"
                      >
                        {job.company?.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                        <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                        <div className="prose max-w-none">
                          <p>{job.description || 'No description provided.'}</p>
                          
                          {job.responsibilities && job.responsibilities.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
                              <ul className="list-disc pl-5 space-y-2">
                                {job.responsibilities.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-lg font-medium mb-2">Requirements</h3>
                              <ul className="list-disc pl-5 space-y-2">
                                {job.requirements.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        // TODO: Implement save job functionality
                        toast({
                          title: 'Save Job',
                          description: 'This feature will be implemented soon.'
                        })
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        // Implement share functionality
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
                      <Share2 className="w-5 h-5" />
                    </Button>
                    <Button 
                      className="bg-[#19C0A8] hover:bg-[#15a894] text-white" 
                      onClick={handleApply}
                      disabled={!isIntern}
                    >
                      {isIntern ? 'Apply Now' : 'Login as Intern to Apply'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
                  <div className="text-teal-600 text-lg font-medium flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {job.salary 
                      ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()} ${job.salary.currency}`
                      : 'Not specified'}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {isIntern ? (
                  <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 mb-4" asChild>
                    <Link href={`/jobs/${params.id}/apply`}>Apply Now</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-gray-400 text-white mb-4" disabled>
                    Intern Access Only
                  </Button>
                )}
                <Button variant="outline" size="lg" className="w-full">
                  Save Job
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full" 
                  asChild
                >
                  <Link href={`/jobs/${params.id}/${job.company?._id}`}>
                    View Company
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium">{job.type || 'Full-time'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium capitalize">{job.level || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium">
                      {job.salary 
                        ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()} ${job.salary.currency}`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{job.isRemote ? 'Remote' : job.location || 'Not specified'}</p>
                  </div>
                  {job.applicationDeadline && (
                    <div>
                      <p className="text-sm text-gray-500">Application Deadline</p>
                      <p className="font-medium">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border rounded-md text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 border rounded-md text-sm"
                  />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md text-sm"
                  />
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Jobs from Same Company */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Recent Jobs from {job.company?.name}</h2>
          <p className="text-sm text-gray-600 mb-6">
            Other opportunities from the same company.
          </p>
          <div className="space-y-4">
            {relatedJobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No other jobs from this company found.</p>
                <p className="text-sm mt-2">Check back later for more opportunities from {job.company?.name}.</p>
              </div>
            ) : (
              relatedJobs.map((relatedJob: any) => (
              <Card key={relatedJob._id} className="border p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {relatedJob.company?.logo ? (
                        <Image
                          src={relatedJob.company.logo}
                          alt={`${relatedJob.company.name} logo`}
                          width={48}
                          height={48}
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">
                          {relatedJob.company?.name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>
                    <div>
                      <Badge className="mb-1">{relatedJob.type || "Full-time"}</Badge>
                      <h3 className="text-lg font-semibold text-gray-900">{relatedJob.title}</h3>
                      <Link 
                        href={`/jobs/${params.id}/${relatedJob.company?._id}`}
                        className="text-sm text-gray-600 hover:text-teal-600 transition-colors duration-200"
                      >
                        {relatedJob.company?.name}
                      </Link>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {relatedJob.createdAt ? new Date(relatedJob.createdAt).toDateString() : "Recently"}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {relatedJob.isRemote ? "Remote" : relatedJob.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {relatedJob.salary 
                            ? `$${relatedJob.salary.min.toLocaleString()} - $${relatedJob.salary.max.toLocaleString()} ${relatedJob.salary.currency}`
                            : "Competitive"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-teal-300 self-start md:self-auto" asChild>
                    <Link href={`/jobs/${relatedJob._id}`}>Job Details</Link>
                  </Button>
                </div>
              </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
