"use client"

import { useState } from "react"
import { useListings } from "@/hooks/useListings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox" // Changed from RadioGroup
import { Search, MapPin, Briefcase, Bookmark, DollarSign, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { LoadingCard, LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"


const companyLogos = {
  Instagram: "/icons/Vector.png",
  Tesla: "/icons/Vector(1).png",
  McDonald: "/icons/Vector(2).png",
  Apple: "/icons/Vector(3).png",
}

const topCompanies = [
    { name: "Instagram", jobs: 23, logo: companyLogos.Instagram, description: "Share and capture the world's moments on our platform." },
    { name: "Tesla", jobs: 11, logo: companyLogos.Tesla, description: "Accelerating the world's transition to sustainable energy." },
    { name: "McDonald's", jobs: 17, logo: companyLogos.McDonald, description: "Serving billions of customers with our world-famous food." },
    { name: "Apple", jobs: 12, logo: companyLogos.Apple, description: "Creating innovative products that enrich people's lives." },
]


// Updated filter data to match the provided image
const categories = [
    { id: "commerce", label: "Commerce", count: 19 },
    { id: "telecommunications", label: "Telecommunications", count: 19 },
    { id: "hotels-tourism", label: "Hotels & Tourism", count: 19 },
    { id: "education", label: "Education", count: 19 },
    { id: "financial-services", label: "Financial Services", count: 19 },
]

const jobTypes = [
    { id: "full-time", label: "Full-Time", count: 12 },
    { id: "part-time", label: "Part-Time", count: 12 },
    { id: "freelance", label: "Freelance", count: 12 },
    { id: "seasonal", label: "Seasonal", count: 12 },
    { id: "fixed-price", label: "Fixed-Price", count: 12 },
]

const experienceLevels = [
    { id: "no-experience", label: "No-experience", count: 19 },
    { id: "fresher", label: "Fresher", count: 19 },
    { id: "intermediate", label: "Intermediate", count: 19 },
    { id: "expert", label: "Expert", count: 19 },
]

const datePostedOptions = [
    { id: "all", label: "All", count: 12 },
    { id: "last-hour", label: "Last Hour", count: 12 },
    { id: "last-24-hours", label: "Last 24 Hours", count: 12 },
    { id: "last-7-days", label: "Last 7 Days", count: 12 },
    { id: "last-30-days", label: "Last 30 Days", count: 12 },
]

const tags = ["engineering", "design", "ui/ux", "marketing", "soft", "construction"]


// --- Main Page Component ---
export default function JobsPage() {


type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  logo: string;
  description: string;
};

const [filters, setFilters] = useState({
  jobTitle: "",
  location: "",
  category: [],
  jobType: [],
  experienceLevel: [],
  datePosted: "all",
  salaryRange: [50, 200],
});

  const { data, isLoading, error } = useListings({
    search: filters.jobTitle,
    location: filters.location,
  });

  const filteredJobs: Job[] = Array.isArray(data?.data)
    ? data.data.map((listing: any) => ({
        id: listing.id || listing._id,
        title: listing.title,
        company: listing.company?.name || listing.user?.name || "Company",
        location: listing.location,
        type: listing.type || (Array.isArray(listing.typesOfEmployment) ? listing.typesOfEmployment.join(", ") : ""),
        salary: listing.salary || (listing.salaryRange ? `$${listing.salaryRange.min || 0} - $${listing.salaryRange.max || 0} ${listing.salaryRange.currency || 'USD'}` : ""),
        posted: listing.posted || new Date(listing.createdAt || Date.now()).toDateString(),
        logo: listing.company?.profile?.logoUrl || listing.logo || "/placeholder.svg",
        description: listing.description,
      }))
    : [];

  return (
    <div className="bg-[#F8F9FB] text-gray-800 min-h-screen font-sans">
      <main className="container mx-auto px-6 py-10 mt-12">
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
          Find Your Dream Job
        </h1>
        <p className="text-gray-600 text-center mb-8">Explore thousands of job opportunities with all the information you need. Find your new job today!</p>
        {/* --- Main Content Area --- */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- Left Sidebar: Filters (Rebuilt to match the image) --- */}
          <aside className="w-full lg:w-[300px] flex-shrink-0 bg-white p-6 rounded-lg shadow-sm h-fit">
            
            {/* Search by Job Title */}
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Search by Job Title</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Job title or company"
                        className="bg-gray-50 border-gray-200 pl-10 text-gray-900 placeholder:text-gray-400 focus:ring-[#19C0A8] focus:border-[#19C0A8] rounded-md"
                        value={filters.jobTitle}
                        onChange={(e) => setFilters(prev => ({...prev, jobTitle: e.target.value}))}
                    />
                </div>
            </div>

            {/* Location */}
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Location</h3>
                 <Select onValueChange={(value) => setFilters(prev => ({...prev, location: value}))}>
                    <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-500 rounded-md focus:ring-[#19C0A8]">
                        <SelectValue placeholder="Choose city" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="london">London, UK</SelectItem>
                        <SelectItem value="new-york">New York, USA</SelectItem>
                        <SelectItem value="california">California, USA</SelectItem>
                        <SelectItem value="texas">Texas, USA</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            {/* Filter sections using Checkbox */}
            {[
                { title: 'Category', items: categories, key: 'category' },
                { title: 'Job Type', items: jobTypes, key: 'jobType' },
                { title: 'Experience Level', items: experienceLevels, key: 'experienceLevel' },
                { title: 'Date Posted', items: datePostedOptions, key: 'datePosted' },
            ].map(section => (
                <div key={section.title} className="mb-6 py-4 border-t border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">{section.title}</h3>
                    <div className="space-y-3">
                        {section.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Checkbox id={item.id} className="w-5 h-5 rounded-[4px] border-gray-400 data-[state=checked]:bg-[#19C0A8] data-[state=checked]:border-[#19C0A8]" />
                                    <Label htmlFor={item.id} className="text-gray-600 font-normal pl-3 cursor-pointer">{item.label}</Label>
                                </div>
                                <span className="text-gray-400 text-sm bg-gray-100 rounded-full px-2 py-0.5">{item.count}</span>
                            </div>
                        ))}
                    </div>
                    {section.title === 'Category' && (
                         <Button variant="link" className="text-[#19C0A8] p-0 h-auto mt-3">Show More</Button>
                    )}
                </div>
            ))}

            {/* Salary */}
            <div className="mb-6 py-4 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Salary</h3>
                <Slider
                    defaultValue={filters.salaryRange}
                    max={400} // Example max
                    step={10}
                    className="[&>span:first-child]:h-1 [&>span>span]:bg-[#19C0A8] [&>span>span]:h-1"
                    onValueChange={(value) => setFilters(prev => ({...prev, salaryRange: value}))}
                />
                <div className="flex justify-between items-center text-sm text-gray-600 mt-3">
                    <span>Salary: ${filters.salaryRange[0]} - ${filters.salaryRange[1]}k</span>
                    <Button className="bg-[#19C0A8] hover:bg-[#15a894] text-white h-8 px-4 rounded-md">Apply</Button>
                </div>
            </div>
            
             {/* Tags */}
            <div className="mb-6 py-4 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Button key={tag} variant="outline" className="bg-gray-100 border-gray-100 text-gray-600 capitalize h-8 rounded-md hover:bg-[#e0f5f2] hover:text-[#19C0A8] hover:border-[#19C0A8]">
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>

          </aside>

          {/* --- Right Content: Job Listings --- */}
          <div className="w-full">
              {/* --- Right Content: Job Listings --- */}
          <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {filteredJobs.length} results
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
              {isLoading ? (
                <LoadingCard />
              ) : error ? (
                <ErrorDisplay error={error} title="Failed to load jobs" />
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No jobs found matching your criteria.
                </div>
              ) : (
                filteredJobs.map((job) => (
                <Card key={job.id} className="bg-white border-gray-200 p-5 shadow-sm">
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
                    <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.type}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                      <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.salary}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.posted}</div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
              </div>
            {/* ... (pagination) ... */}
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
           
        </div>
        
        </div> 
      </main>
      {/* --- Top Companies Section --- */}
        <section className="bg-[#F0F5F5] mt-12 py-6 w-full">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Company</h2>
          <p className="text-gray-600 mb-10">Explore thousands of trusted companies and find the perfect one for you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topCompanies.map((company) => (
              <div key={company.name} className="bg-white p-4 rounded-lg flex flex-col items-center shadow-sm m-4">
                <div className="w-10 h-10 p-2 bg-black rounded-lg flex items-center justify-center mb-4">
                  <Image src={company.logo} alt={`${company.name} logo`} width={30} height={30} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-600 mt-2 h-10">{company.description}</p>
                <Button variant="outline" className="text-[#19C0A8] border-[#19C0A8] hover:bg-[#19C0A8] hover:text-white mt-4 w-full rounded-md">
                  {company.jobs} open jobs
                </Button>
              </div>
            ))}
          </div>
        </div>
          </section>
    </div>
  )
}