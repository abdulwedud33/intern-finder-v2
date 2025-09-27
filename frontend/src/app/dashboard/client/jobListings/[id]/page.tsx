"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { getListingById } from "@/services/listingsService"

type JobDetailsPageProps = {
  params: {
    id: string
  }
}

export default function JobDetailsPage({ params }: JobDetailsPageProps ) {
  const { data } = useQuery({ queryKey: ["company-listing", params.id], queryFn: () => getListingById(params.id) })
  const job = data?.listing
  const id=params.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/client/jobListings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {job?.title || "Job"}
              </Button>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                More Action
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Job</DropdownMenuItem>
              <DropdownMenuItem>Duplicate Job</DropdownMenuItem>
              <DropdownMenuItem>Archive Job</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Job</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b">
          <Link href={`/dashboard/client/jobListings/${params.id}/applicants`}>
            <Button variant="ghost" className="border-b-2 border-transparent hover:border-teal-500">
              Applicants
            </Button>
          </Link>
          <Button variant="ghost" className="border-b-2 border-teal-500 text-teal-600">
            Job Details
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    S
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{job?.title || "Job"}</h1>
                    <p className="text-gray-600">{job?.location} • {job?.typesOfEmployment?.join(", ") || ""} • {job?.applicantsCount ?? 0} / {job?.capacity ?? 0} Hired</p>
                  </div>
                </div>
                <Button className="bg-teal-500 hover:bg-teal-600">Edit Job Details</Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job?.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {(job?.keyResponsibilities || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who You Are */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Who You Are</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    You get energy from people and building the ideal work environment
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">You have a sense for beautiful spaces and office experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    You are a confident office manager, ready for added responsibilities
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">You're detail-oriented and creative</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">You're a growth marketer and know how to run campaigns</span>
                </li>
              </ul>
            </div>

            {/* Nice-To-Haves */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Nice-To-Haves</h2>
              <ul className="space-y-3">
                {(job?.niceToHaves || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About this role */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-4">About this role</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{job?.applicantsCount ?? 0} applied</span>
                  <span className="font-medium">of {job?.capacity ?? 0} capacity</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Apply Before</span>
                  <span>{job?.dueDate ? new Date(job?.dueDate).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Posted On</span>
                  <span>{job?.createdAt ? new Date(job?.createdAt).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type</span>
                  <span>{job?.typesOfEmployment?.join(", ") || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary</span>
                  <span>{job?.salaryRange ? `$${job.salaryRange.min} - $${job.salaryRange.max}` : "—"}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-orange-100 text-orange-800">Marketing</Badge>
                <Badge className="bg-green-100 text-green-800">Design</Badge>
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Project Management</Badge>
                <Badge variant="outline">Copywriting</Badge>
                <Badge variant="outline">English</Badge>
                <Badge variant="outline">Social Media Marketing</Badge>
                <Badge variant="outline">Copy Editing</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
