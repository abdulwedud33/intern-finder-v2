"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import briefCase from "../../public/images/briefcase(2) 2.png";
import building from "../../public/images/building 1.png";
import g2081 from "../../public/images/g2081.png";
import logo1 from "../../public/images/logo(1).png";
import logo2 from "../../public/images/logo(2).png";
import logo from "../../public/images/logo.png";
import logos from "../../public/images/logos.png";
import goodLife from "../../public/images/good life.avif";
import work1 from "../../public/images/work1.jpg";
import work2 from "../../public/images/work2.jpg";
import betterFuture from "../../public/images/better future.jpg";
import { useListings } from "@/hooks/useListings"
import { LoadingCard } from "@/components/ui/loading-spinner"

const FEATURED_JOBS_COUNT = 4

const categories = [
  { name: "Design", count: "235 Jobs", icon: "🎨" },
  { name: "Sales", count: "756 Jobs", icon: "💼" },
  { name: "Marketing", count: "140 Jobs", icon: "📈" },
  { name: "Finance", count: "325 Jobs", icon: "💰" },
  { name: "Technology", count: "436 Jobs", icon: "💻" },
  { name: "Engineering", count: "542 Jobs", icon: "⚙️" },
  { name: "Business", count: "211 Jobs", icon: "🏢" },
  { name: "Human Resource", count: "346 Jobs", icon: "👥" },
]

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

const blogPosts = [
  {
    title: "How to win any job you want. Get started with 5 steps.",
    excerpt: "The best way to prepare for your next job interview is to practice. Here are some tips to help you get started.",
    image: work1,
    date: "Jan 15, 2024",
    author: "John Doe",
  },
  {
    title: "The secrets to finding the perfect job in 2024.",
    excerpt: "In today's competitive job market, finding the perfect job can be challenging. Here are some strategies to help you succeed.",
    image: work2,
    date: "Jan 12, 2024",
    author: "Jane Smith",
  },
]

export default function Homepage() {
  const { data: listingsData, isLoading, error } = useListings({ limit: FEATURED_JOBS_COUNT })
  const featuredJobs = listingsData?.data?.slice(0, FEATURED_JOBS_COUNT) || []

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

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 max-w-4xl mx-auto flex flex-col w-full mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Job title, keywords, or company" className="pl-10 h-11 sm:h-12 text-gray-900 w-full" />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Location" className="pl-10 h-11 sm:h-12 text-gray-900 w-full" />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Select Category"
                className="h-11 sm:h-12 px-4 rounded-full border border-gray-300 text-black focus:outline-none w-full"
              />
            </div>
            <Button className="h-11 sm:h-12 px-6 sm:px-8 bg-teal-500 hover:bg-teal-600 w-full sm:w-auto">
              Search Jobs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 text-center mb-8 sm:mb-10">
          <div className="flex flex-row items-center gap-2">
            <div className="flex items-center justify-center bg-teal-400 rounded-full p-1">
              <Image src={briefCase} alt="Briefcase Icon" width={24} height={24} className="m-1 rounded-xl" />
            </div>
            <div className="text-white flex flex-col">
              <span className="text-md sm:text-xl">25,000+</span>
              <span className="text-sm sm:text-base">jobs</span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="flex items-center justify-center bg-teal-400 rounded-full p-1">
              <Image src={building} alt="Building Icon" width={24} height={24} className="m-1 rounded-xl" />
            </div>
            <div className="text-white flex flex-col">
              <span className="text-md sm:text-xl">1,000+</span>
              <span className="text-sm sm:text-base">companies</span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="flex items-center justify-center bg-teal-400 rounded-full p-1">
              <Image src={g2081} alt="Users Icon" width={24} height={24} className="m-1 rounded-xl" />
            </div>
            <div className="text-white flex flex-col">
              <span className="text-md sm:text-xl">100,000+</span>
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

      {/* live fetched jobs */}
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
                <Card key={job.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={job.company?.profile?.logoUrl && job.company.profile.logoUrl !== "no-logo.jpg" ? job.company.profile.logoUrl : "/placeholder.svg"}
                          alt={job.company?.name || "Company"}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.company?.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {job.typesOfEmployment?.join(", ") || "Full-time"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <span>{job.createdAt ? new Date(job.createdAt).toDateString() : "Recently"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-teal-600">{job.salaryRange ? `$${job.salaryRange.min} - $${job.salaryRange.max}` : job.salary || "Competitive"}</span>
                      <Button className="bg-teal-500 hover:bg-teal-600" asChild>
                        <Link href={`/jobs/${job._id || job.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Browse by Category */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find the job that's perfect for you. about 800+ new jobs everyday</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count}</p>
                </CardContent>
              </Card>
            ))}
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
              <p>
                We connect you with top companies looking for talent like you. Explore opportunities that match your skills and aspirations.
              </p>
                <Button className="text-white bg-teal-700 px-8 mt-6 py-4 text-lg font-semibold">
                  Find Your Company
                </Button>
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-bold text-teal-600">12k+</span>
                  <span className="text-gray-600">Happy Employees</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-bold text-teal-600">20k+</span>
                  <span className="text-gray-600">Companies</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-bold text-teal-600">18k+</span>
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
            <p className="text-sm mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who found their dream jobs through our platform.
            </p>
            <Button className="text-white bg-teal-700 px-8 py-4 text-lg font-semibold">
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

      {/* Blog Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">News and Blog</h2>
            <p className="text-gray-600">Get the latest news, updates and tips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {blogPosts.map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>By {post.author}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Button variant="ghost" className="p-0 h-auto text-teal-600 hover:text-teal-700">
                    Read More <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}