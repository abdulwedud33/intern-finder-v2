"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, Share2, Heart, Briefcase } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useListing, useListings } from "@/hooks/useListings"
import { useApplyToListing } from "@/hooks/useApplications"
import { useAuthUser } from "@/hooks/useAuth"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { use } from "react"


const RELATED_JOBS_COUNT = 3

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data, isLoading, error } = useListing(resolvedParams.id)
  const { data: allListingsData } = useListings({ limit: 20 })
  const { data: user } = useAuthUser()
  const applyMutation = useApplyToListing()

  // Check if user is an intern
  const isIntern = user?.role === 'intern'

  // Extract the actual listing from the API response
  const listing = (data as any)?.listing || (data as any)?.data

  // Helper function to validate and format logo URL
  const getValidLogoUrl = (logoUrl: string | undefined) => {
    if (!logoUrl || logoUrl === "no-logo.jpg" || !logoUrl.startsWith("http")) {
      return "/placeholder.svg?height=80&width=80&text=CO"
    }
    return logoUrl
  }

  // Get related jobs based on company or similar criteria
  const getRelatedJobs = () => {
    if (!listing || !allListingsData?.data) return []
    
    const allJobs = allListingsData.data
    const currentJobId = listing._id || listing.id
    const currentCompany = listing.company?.name
    
    // First try to get jobs from the same company
    const sameCompanyJobs = allJobs
      .filter((job: any) => 
        (job._id || job.id) !== currentJobId && 
        job.company?.name === currentCompany
      )
      .slice(0, RELATED_JOBS_COUNT)
    
    // If we have enough jobs from the same company, return them
    if (sameCompanyJobs.length >= RELATED_JOBS_COUNT) {
      return sameCompanyJobs
    }
    
    // Otherwise, fill remaining slots with other jobs
    const otherJobs = allJobs
      .filter((job: any) => 
        (job._id || job.id) !== currentJobId && 
        job.company?.name !== currentCompany
      )
      .slice(0, RELATED_JOBS_COUNT - sameCompanyJobs.length)
    
    return [...sameCompanyJobs, ...otherJobs]
  }

  const relatedJobs = getRelatedJobs()

  if (isLoading) return <LoadingPage />
  if (error) return <ErrorPage error={error} />
  if (!listing) return <ErrorPage title="Job not found" description="The job listing you're looking for doesn't exist." />

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
                    <Image
                      src={getValidLogoUrl(listing?.company?.profile?.logoUrl)}
                      alt={listing?.company?.name || "Company"}
                      width={60}
                      height={60}
                      className="rounded-lg"
                    />
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">{listing?.title || "Loading..."}</h1>
                      <p className="text-gray-600">{listing?.company?.name || ""}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {listing?.location || ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {listing?.createdAt ? new Date(listing.createdAt).toDateString() : ""}
                        </span>
                        {listing?.typesOfEmployment?.length > 0 ? <Badge variant="secondary">{listing.typesOfEmployment.join(", ")}</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
                  <div className="text-teal-600 text-lg font-medium flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {listing?.salaryRange ? `$${listing.salaryRange.min} - $${listing.salaryRange.max}` : listing?.salary || ""}
                  </div>
                </div>
                
              </CardContent>
            </Card>

            {[ ["Job Description", listing?.description], ["Key Responsibilities", listing?.keyResponsibilities], ["Preferred Skills", listing?.qualifications] ].map(([title, content], idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(content) ? (
                    <ul className="space-y-2">
                      {content.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-teal-600 mr-2">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{content as string}</p>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex flex-wrap gap-2">
              {(listing?.skills || []).map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-sm">{skill}</Badge>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {isIntern ? (
                  <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 mb-4" asChild>
                    <Link href={`/jobs/${resolvedParams.id}/apply`}>Apply Now</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-gray-400 text-white mb-4" disabled>
                    Intern Access Only
                  </Button>
                )}
                <Button variant="outline" size="lg" className="w-full">
                  Save Job
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["Job Title", listing?.title],
                  ["Location", listing?.location],
                  ["Job Type", listing?.type],
                  ["Salary", listing?.salaryRange ? `$${listing.salaryRange.min} - $${listing.salaryRange.max}` : ""],
                ].map(([label, value], i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{label}</span>
                      <span className="text-gray-900 font-medium">{value as string}</span>
                    </div>
                  </div>
                ))}
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

        {/* Related Jobs */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Related Jobs</h2>
          <p className="text-sm text-gray-600 mb-6">
            Jobs from the same company and similar opportunities.
          </p>
          <div className="space-y-4">
            {relatedJobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No related jobs found.</p>
                <p className="text-sm mt-2">Debug: listing={!!listing}, allListingsData={!!allListingsData?.data}, dataLength={allListingsData?.data?.length || 0}, currentId={listing?._id || listing?.id}</p>
              </div>
            ) : (
              relatedJobs.map((job: any) => (
              <Card key={job._id || job.id} className="border p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src={getValidLogoUrl(job.company?.profile?.logoUrl)}
                      alt={job.company?.name || "Company"}
                      width={48}
                      height={48}
                      className="rounded-md"
                    />
                    <div>
                      <Badge className="mb-1">{job.typesOfEmployment?.join(", ") || "Full-time"}</Badge>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company?.name}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.createdAt ? new Date(job.createdAt).toDateString() : "Recently"}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salaryRange ? `$${job.salaryRange.min} - $${job.salaryRange.max}` : job.salary || "Competitive"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-teal-300 self-start md:self-auto" asChild>
                    <Link href={`/jobs/${job._id || job.id}`}>Job Details</Link>
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
