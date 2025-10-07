"use client"

import { useState, useEffect } from "react"
import { useJobs, Job } from "@/hooks/useJobs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase, Bookmark, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"


// --- Main Page Component ---
export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const { 
    jobs, 
    loading, 
    error, 
    total, 
    updateFilters 
  } = useJobs();

  // Update filters when search or filters change
  useEffect(() => {
    const filters = {
      search: searchQuery,
      location: locationFilter,
      company: companyFilter,
      // Remove status filter to show all jobs (published, active, draft, etc.)
      limit: 20
    };
    
    updateFilters(filters);
  }, [searchQuery, locationFilter, companyFilter, updateFilters]);

  // Format job data for display
  const formatJobForDisplay = (job: Job) => ({
    id: job._id,
    title: job.title,
    company: job.company?.name || "Company",
    location: job.location,
    type: job.type,
    salary: job.salary ? (typeof job.salary === 'string' 
      ? job.salary 
      : `$${job.salary?.min?.toLocaleString()} - $${job.salary?.max?.toLocaleString()} ${job.salary?.currency || ''}/${job.salary?.period || ''}`) : "Salary not specified",
    posted: new Date(job.createdAt).toLocaleDateString(),
    logo: job.company?.logo || "/placeholder.svg",
    description: job.description,
    isRemote: job.isRemote
  });

  const displayedJobs = jobs.map(formatJobForDisplay);

  // Debug logging
  console.log('JobsPage - jobs:', jobs);
  console.log('JobsPage - displayedJobs:', displayedJobs);
  console.log('JobsPage - loading:', loading);
  console.log('JobsPage - error:', error);

  return (
    <div className="bg-[#F8F9FB] text-gray-800 min-h-screen font-sans">
      <main className="container mx-auto px-6 py-10 mt-12">
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
          Find Your Dream Job
        </h1>
        <p className="text-gray-600 text-center mb-8">Explore thousands of job opportunities with all the information you need. Find your new job today!</p>
        
        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Job Title or Company */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Job title or company name"
                className="bg-gray-50 border-gray-200 pl-10 text-gray-900 placeholder:text-gray-400 focus:ring-[#19C0A8] focus:border-[#19C0A8] rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <Select onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-500 rounded-md focus:ring-[#19C0A8]">
                <SelectValue placeholder="Choose location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="london">London, UK</SelectItem>
                <SelectItem value="new-york">New York, USA</SelectItem>
                <SelectItem value="california">California, USA</SelectItem>
                <SelectItem value="texas">Texas, USA</SelectItem>
              </SelectContent>
            </Select>

            {/* Company Filter */}
            <Input
              type="text"
              placeholder="Filter by company"
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-[#19C0A8] focus:border-[#19C0A8] rounded-md"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {displayedJobs.length} of {total} results
            </p>
            <Select defaultValue="newest">
              <SelectTrigger className="w-auto bg-transparent border-none text-gray-800 font-semibold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="relevant">Most Relevant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {loading ? (
              <LoadingCard />
            ) : error ? (
              <ErrorDisplay error={error} title="Failed to load jobs" />
            ) : displayedJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No jobs found matching your criteria.
              </div>
            ) : (
              displayedJobs.map((job) => (
              <Card key={job.id} className="bg-white border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-500">{job.company}</p>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Bookmark className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>                     
                    <Button asChild className="bg-[#19C0A8] text-white font-semibold hover:bg-[#15a894] rounded-md px-6 hidden sm:inline-flex">
                   <Link href={`/jobs/${job.id}`}>View Details</Link>
                     </Button> 
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 flex-shrink-0" /> 
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 flex-shrink-0" /> 
                      <span>{job.isRemote ? 'Remote' : job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 flex-shrink-0" /> 
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 flex-shrink-0" /> 
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
               <Button variant="outline" className="bg-white border-gray-300">Prev</Button>
               <Button variant="outline" className="bg-[#19C0A8] text-white border-[#19C0A8]">1</Button>
               <Button variant="outline" className="bg-white border-gray-300">2</Button>
               <Button variant="outline" className="bg-white border-gray-300">...</Button>
               <Button variant="outline" className="bg-white border-gray-300">9</Button>
               <Button variant="outline" className="bg-white border-gray-300">10</Button>
               <Button variant="outline" className="bg-white border-gray-300">Next</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}