"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Filter, MoreHorizontal, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const applicants = [
  {
    id: "1",
    name: "Jake Gyil",
    avatar: "/professional-headshot-jerome-bell.png",
    score: 0.0,
    stage: "In Review",
    appliedDate: "13 July, 2021",
    status: "in-review",
  },
  {
    id: "2",
    name: "Guy Hawkins",
    avatar: "/professional-headshot-guy-hawkins.png",
    score: 0.0,
    stage: "In Review",
    appliedDate: "13 July, 2021",
    status: "in-review",
  },
  {
    id: "3",
    name: "Rodolfo Goode",
    avatar: "/professional-headshot-rodolfo-goode.png",
    score: 3.75,
    stage: "Declined",
    appliedDate: "11 July, 2021",
    status: "declined",
  },
  {
    id: "4",
    name: "Leif Floyd",
    avatar: "/professional-headshot-leif-floyd.png",
    score: 4.8,
    stage: "Hired",
    appliedDate: "11 July, 2021",
    status: "hired",
  },
  {
    id: "5",
    name: "Jenny Wilson",
    avatar: "/professional-headshot-jenny-wilson.png",
    score: 4.6,
    stage: "Hired",
    appliedDate: "9 July, 2021",
    status: "hired",
  },
  {
    id: "6",
    name: "Jerome Bell",
    avatar: "/professional-headshot-jerome-bell.png",
    score: 4.0,
    stage: "Interview",
    appliedDate: "5 July, 2021",
    status: "interview",
  },
  {
    id: "7",
    name: "Eleanor Pena",
    avatar: "/professional-headshot-eleanor-pena.png",
    score: 3.9,
    stage: "Declined",
    appliedDate: "5 July, 2021",
    status: "declined",
  },
  {
    id: "8",
    name: "Floyd Miles",
    avatar: "/professional-headshot-floyd-miles.png",
    score: 4.1,
    stage: "Interview",
    appliedDate: "1 July, 2021",
    status: "interview",
  },
]

const pipelineData = {
  "In Review": applicants.filter((a) => a.status === "in-review"),
  Interview: applicants.filter((a) => a.status === "interview"),
  Hired: applicants.filter((a) => a.status === "hired"),
  Declined: applicants.filter((a) => a.status === "declined"),
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    "in-review": { label: "In Review", className: "bg-orange-100 text-orange-800" },
    interview: { label: "Interview", className: "bg-blue-100 text-blue-800" },
    hired: { label: "Hired", className: "bg-green-100 text-green-800" },
    declined: { label: "Declined", className: "bg-red-100 text-red-800" },
  }
  return statusConfig[status as keyof typeof statusConfig] || statusConfig["in-review"]
}

export default function JobApplicantsPage() {
  const params = useParams()
  const id = params.id as string;
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplicants = applicants.filter((applicant) =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/client/jobListings/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Social Media Assistant
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
              <DropdownMenuItem>Export Applicants</DropdownMenuItem>
              <DropdownMenuItem>Send Bulk Email</DropdownMenuItem>
              <DropdownMenuItem>Archive All</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b">
          <Button variant="ghost" className="border-b-2 border-teal-500 text-teal-600">
            Applicants
          </Button>
          <Link href={`/dashboard/client/jobListings/${params.id}`}>
            <Button variant="ghost" className="border-b-2 border-transparent hover:border-teal-500">
              Job Details
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Total Applicants: {applicants.length}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Applicants"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "pipeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("pipeline")}
                className="text-xs"
              >
                Pipeline View
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="text-xs"
              >
                Table View
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Hiring Stage</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.map((applicant) => {
                  const statusConfig = getStatusBadge(applicant.status)
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                            <AvatarFallback>
                              {applicant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{applicant.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{applicant.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{applicant.appliedDate}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/client/applicants/${applicant.id}`}>
                          <Button variant="outline" size="sm">
                            See Application
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {Object.entries(pipelineData).map(([stage, stageApplicants]) => (
              <div key={stage} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{stage}</h3>
                  <Badge variant="outline">{stageApplicants.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageApplicants.map((applicant) => (
                    <div key={applicant.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                          <AvatarFallback className="text-xs">
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{applicant.name}</p>
                          <Link
                            href={`/dashboard/client/applicants/${applicant.id}`}
                            className="text-xs text-teal-600 hover:underline"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Applied on</p>
                        <p>{applicant.appliedDate}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{applicant.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
