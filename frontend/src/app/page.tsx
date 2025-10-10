"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, Users, Building2, Briefcase, TrendingUp, CheckCircle, MapPin, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useJobs } from "@/hooks/useJobs"
import { useCompanies } from "@/hooks/useCompanies"
import { useUsersCount } from "@/hooks/useUsers"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { useAuth } from "@/contexts/AuthContext"
import { getImageUrl, getCompanyLogoUrl } from "@/utils/imageUtils"
import { decodeHtmlEntities } from "@/utils/htmlUtils"

// Import images
import briefCase from "../../public/images/briefcase(2) 2.png"
import building from "../../public/images/building 1.png"
import g2081 from "../../public/images/g2081.png"
import logo1 from "../../public/images/logo(1).png"
import logo2 from "../../public/images/logo(2).png"
import logo from "../../public/images/logo.png"
import logos from "../../public/images/logos.png"
import goodLife from "../../public/images/good life.avif"
import work1 from "../../public/images/work1.jpg"
import work2 from "../../public/images/work2.jpg"
import betterFuture from "../../public/images/better future.jpg"

const FEATURED_JOBS_COUNT = 4

const testimonials = [
  {
    name: "Robert Fox",
    role: "UI/UX Designer",
    company: "Corner Stone",
    image: "/placeholder.svg?height=60&width=60&text=RF",
    content: "The best platform for job seekers. I found my dream job in just a few days!",
    rating: 5,
  },
  {
    name: "Bessie Cooper",
    role: "Creative Director",
    company: "Bright Agency",
    image: "/placeholder.svg?height=60&width=60&text=BC",
    content: "Amazing experience! The job search process was smooth and efficient.",
    rating: 5,
  },
]



export default function Homepage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Fetch data for stats and featured jobs
  const { jobs: allJobs, loading: jobsLoading, error: jobsError, total: totalJobs } = useJobs({ limit: 4 })
  const { companies, loading: companiesLoading, total: totalCompanies } = useCompanies({ limit: 1 })
  const { data: usersCountData, isLoading: usersLoading } = useUsersCount()
  
  // Mock data for users count (replace with real API call when available)
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalUsers: 0,
    activeJobs: 0
  })

  // Update stats when data loads
  useEffect(() => {
    setStats({
      totalJobs: totalJobs || 0,
      totalCompanies: totalCompanies || 0,
      totalUsers: usersCountData?.data?.totalUsers || 0,
      activeJobs: totalJobs || 0
    })
  }, [totalJobs, totalCompanies, usersCountData])

  // Get the first 4 jobs as featured jobs
  const featuredJobs = allJobs.slice(0, 4)
  const isLoading = jobsLoading
  const error = jobsError


  // Handle "Find Your Company" button click
  const handleFindCompanyClick = () => {
    router.push('/dashboard/intern/company')
  }

  // Handle "Get Started Now" button click
  const handleGetStartedClick = () => {
    router.push('/register')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[url('/images/hero-section-bg.jpg')] bg-cover bg-center min-h-screen text-white">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/80"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center min-h-screen py-12">
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-12 font-bold mb-4 text-center">
            Find Your Dream Job Today!
          </h1>
          <p className="text-base sm:text-lg text-gray-300 text-center max-w-xl md:max-w-2xl mb-6 sm:mb-8">
            Connecting Talent with Opportunity: Your Gateway to Career Success
          </p>

          {/* Call to Action Buttons */}
          <div className="rounded-lg shadow-lg p-2 sm:p-4 max-w-2xl mx-auto flex flex-col justify-center items-center sm:flex-row gap-4 w-full mb-8 sm:mb-10">
            <Link href="/jobs">
            <Button 
              size="lg"
              className="h-12 sm:h-14 px-8 bg-teal-500 hover:bg-teal-600 text-white font-semibold flex-1"
              onClick={() => router.push('/jobs')}
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Explore Jobs
            </Button>
            </Link>
             <Link href="/register">
              <Button 
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-8 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white font-semibold w-full"
              >
                <Users className="h-5 w-5 mr-2" />
                Get Started Now
              </Button>
             </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 text-center mb-8 sm:mb-10">
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center justify-center bg-teal-400 rounded-full p-1">
                <Image src={briefCase} alt="Briefcase Icon" width={24} height={24} className="m-1 rounded-xl" />
              </div>
              <div className="text-white flex flex-col">
                <span className="text-md sm:text-xl font-bold">
                  {stats.totalJobs > 0 ? `${stats.totalJobs.toLocaleString()}+` : "25,000+"}
                </span>
                <span className="text-sm sm:text-base">jobs</span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center justify-center bg-teal-400 rounded-full p-1">
                <Image src={building} alt="Building Icon" width={24} height={24} className="m-1 rounded-xl" />
              </div>
              <div className="text-white flex flex-col">
                <span className="text-md sm:text-xl font-bold">
                  {stats.totalCompanies > 0 ? `${stats.totalCompanies.toLocaleString()}+` : "1,000+"}
                </span>
                <span className="text-sm sm:text-base">companies</span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center justify-center bg-teal-400 rounded-full p-1">
                <Image src={g2081} alt="Users Icon" width={24} height={24} className="m-1 rounded-xl" />
              </div>
              <div className="text-white flex flex-col">
                <span className="text-md sm:text-xl font-bold">
                  {stats.totalUsers.toLocaleString()}+
                </span>
                <span className="text-sm sm:text-base">users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className="absolute bottom-0 w-full bg-black py-4 px-4 sm:px-6">
          <div className="flex flex-wrap justify-center sm:justify-evenly gap-4 sm:gap-6 md:gap-8 items-center">
            <Image src={logo1} alt="Slack" width={80} height={32} className="w-16 sm:w-20 md:w-24" />
            <Image src={logo2} alt="Adobe" width={80} height={32} className="w-16 sm:w-20 md:w-24" />
            <Image src={logo} alt="Asana" width={80} height={32} className="w-16 sm:w-20 md:w-24" />
            <Image src={logos} alt="Linear" width={80} height={32} className="w-16 sm:w-20 md:w-24" />
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Jobs</h2>
              <p className="text-gray-600">Know your worth and find the job that qualify your life</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/jobs">Show all jobs</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full">
                <LoadingCard />
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-500">Failed to load jobs.</div>
            ) : featuredJobs.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No jobs found.</div>
            ) : (
              featuredJobs.map((job: any) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {job.company?.logo ? (
                            <Image
                              src={getCompanyLogoUrl(job.company.logo)}
                              alt={`${job.company.name} logo`}
                              width={48}
                              height={48}
                              className="object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-lg font-bold text-gray-400 ${job.company?.logo ? 'hidden' : ''}`}>
                            {job.company?.name?.charAt(0) || 'C'}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.company?.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {job.type || "Full-time"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.isRemote ? "Remote" : job.location}
                      </div>
                      <span>{job.createdAt ? new Date(job.createdAt).toDateString() : "Recently"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-teal-600">
                        {job.salary 
                          ? (typeof job.salary === 'string' 
                              ? decodeHtmlEntities(job.salary)
                              : `$${job.salary.min?.toLocaleString()} - $${job.salary.max?.toLocaleString()} ${job.salary.currency || ''}`)
                          : "Competitive"
                        }
                      </span>
                      <Button className="bg-teal-500 hover:bg-teal-600" asChild>
                        <Link href={`/jobs/${job._id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Good Life Section */}
      <section className="py-16 text-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-18">
            {/* Image on left - only shows on larger screens */}
            <div className="hidden lg:block flex-1">
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image 
                  src={goodLife} 
                  alt="Happy employees at work"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Content on right */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Good Life Begins With
              </h2>
              <h4 className="text-3xl md:text-4xl font-bold text-teal-600 mb-6">
                A Good Company
              </h4>
              <p className="text-gray-600 mb-6">
                We connect you with top companies looking for talent like you. Explore opportunities that match your skills and aspirations.
              </p>
              <Button 
                className="text-white bg-teal-700 px-8 mt-6 py-4 text-lg font-semibold hover:bg-teal-800"
                onClick={handleFindCompanyClick}
              >
                Find Your Company
              </Button>
              
              {/* Updated Stats with real data */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-teal-600" />
                    <span className="text-3xl font-bold text-teal-600">
                      {stats.totalUsers.toLocaleString()}+
                    </span>
                  </div>
                  <span className="text-gray-600">Happy Users</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-teal-600" />
                    <span className="text-3xl font-bold text-teal-600">
                      {stats.totalCompanies > 0 ? `${stats.totalCompanies.toLocaleString()}+` : "1,000+"}
                    </span>
                  </div>
                  <span className="text-gray-600">Companies</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-teal-600" />
                    <span className="text-3xl font-bold text-teal-600">
                      {stats.activeJobs > 0 ? `${stats.activeJobs.toLocaleString()}+` : "500+"}
                    </span>
                  </div>
                  <span className="text-gray-600">Active Jobs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Better Future Section */}
      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 text-white bg-black rounded-md shadow-2xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Create A Better<br className="hidden md:block" />
              Future For Yourself
            </h2>
            <p className="text-sm mb-8 max-w-2xl mx-auto text-gray-300">
              Join thousands of professionals who found their dream jobs through our platform.
            </p>
            <Button 
              className="text-white bg-teal-700 px-8 py-4 text-lg font-semibold hover:bg-teal-800"
              onClick={handleGetStartedClick}
            >
              Get Started Now
            </Button>
          </div>
          <div className="relative w-full lg:w-1/2 h-96 rounded-lg overflow-hidden">
            <Image 
              src={betterFuture} 
              alt="Better Future"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Testimonials From Our Customers</h2>
            <p className="text-gray-300">
              Hear what our users have to say about their experience with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 text-center fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gray-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-xl mb-8 text-teal-100 max-w-2xl mx-auto">
            Join thousands of professionals who have already found their perfect career match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => router.push('/jobs')}
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Browse Jobs
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-3"
              onClick={handleGetStartedClick}
            >
              <Users className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}