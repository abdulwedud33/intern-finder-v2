"use client"

import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from "react"
import {
  ArrowLeft,
  MoreVertical,
  Star,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApplicationById, updateApplication, scheduleInterview } from "@/services/applicationsService"
import { useToast } from "@/components/ui/use-toast"
import { useParams } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ApplicantDetailsPage() {
  const params = useParams()
  const applicationId = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("profile")
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [newNote, setNewNote] = useState("");
  const [isNotePopoverOpen, setIsNotePopoverOpen] = useState(false);
  const [notes, setNotes] = useState([
    {
      id: 1,
      author: "Maria Kelly",
      avatar: "https://placehold.co/150x150/d1d5db/000000?text=MK",
      date: "10 July, 2021",
      time: "11:30 AM",
      text: "Please, do an interview stage immediately. The design division needs more new employee now",
      replies: 2,
    },
    {
      id: 2,
      author: "Maria Kelly",
      avatar: "https://placehold.co/150x150/d1d5db/000000?text=MK",
      date: "13 July, 2021",
      time: "10:30 AM",
      text: "Please, do an interview stage immediately.",
      replies: 0,
    },
  ]);

  const { data } = useQuery({ 
    queryKey: ["application", applicationId], 
    queryFn: () => getApplicationById(applicationId) 
  })
  
  const application = (data as any)?.data
  const applicantData = {
    id: application?._id || "",
    name: application?.user?.name || "",
    role: application?.user?.role || "",
    avatar: application?.user?.avatar || "/placeholder.svg",
    rating: application?.score || 0,
    appliedJob: application?.listing?.title || "",
    appliedDate: application?.createdAt ? new Date(application.createdAt).toLocaleDateString() : "",
    stage: application?.stage || "Applied",
    stageProgress: getStageProgress(application?.stage || "Applied"),
    contact: {
      email: application?.user?.email || "",
      phone: application?.user?.phone || "",
      instagram: application?.user?.instagram || "",
      twitter: application?.user?.twitter || "",
      website: application?.user?.website || "",
    },
    personalInfo: {
      fullName: application?.user?.name || "",
      gender: application?.user?.gender || "",
      dateOfBirth: application?.user?.dateOfBirth || "",
      language: application?.user?.language || "",
      address: application?.user?.address || "",
    },
    professionalInfo: {
      aboutMe: application?.user?.aboutMe || "",
      experience: application?.user?.experience || "",
      currentJob: application?.user?.currentJob || "",
      experienceYears: application?.user?.experienceYears || "",
      education: application?.user?.education || "",
      skills: Array.isArray(application?.user?.skills) ? application?.user?.skills : [],
    },
    interviews: application?.interviews || [],
    notes: application?.notes || [],
    assignedTo: application?.assignedTo || []
  }

  function getStageProgress(stage: string): number {
    const stages = ["Applied", "Review", "Shortlisted", "Interview", "Hired"]
    const index = stages.indexOf(stage)
    return index >= 0 ? ((index + 1) / stages.length) * 100 : 0
  }

  const updateStageMutation = useMutation({
    mutationFn: async (newStage: string) => {
      return await updateApplication(applicationId, { stage: newStage })
    },
    onSuccess: () => {
      toast({ title: "Stage updated successfully" })
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] })
      queryClient.invalidateQueries({ queryKey: ["company-applications"] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: unknown } } }
      const message = typeof err?.response?.data?.message === "string" ? err.response.data.message : "Failed to update stage"
      toast({ title: "Could not update stage", description: String(message), variant: "destructive" })
    },
  })

  const scheduleInterviewMutation = useMutation({
    mutationFn: async (interviewData: { date: string; time: string; location: string; interviewer: string }) => {
      return await scheduleInterview(applicationId, interviewData)
    },
    onSuccess: () => {
      toast({ title: "Interview scheduled successfully" })
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: unknown } } }
      const message = typeof err?.response?.data?.message === "string" ? err.response.data.message : "Failed to schedule interview"
      toast({ title: "Could not schedule interview", description: String(message), variant: "destructive" })
    },
  })

  const handleAddNote = () => {
    if (newNote.trim() !== "") {
      const newNoteObject = {
        id: notes.length + 1,
        author: "Current User",
        avatar: "https://placehold.co/150x150/888888/FFFFFF?text=CU",
        date: new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }),
        time: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
        text: newNote,
        replies: 0,
      };
      setNotes([newNoteObject, ...notes]);
      setNewNote("");
      setIsNotePopoverOpen(false);
    }
  };

  const handleStageUpdate = (newStage: string) => {
    updateStageMutation.mutate(newStage)
  }

  const handleScheduleInterview = () => {
    // This would typically open a modal with interview scheduling form
    const interviewData = {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      time: "10:00 AM - 11:00 AM",
      location: "Virtual Meeting",
      interviewer: "Hiring Manager"
    }
    scheduleInterviewMutation.mutate(interviewData)
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/client/applicants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Applicant Details
            </Button>
          </Link>
          
        </div>
        <Button variant="outline" size="sm">
          <MoreVertical className="h-4 w-4 mr-2" />
          More Action
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={applicantData.avatar || "/placeholder.svg"} alt={applicantData.name} />
                  <AvatarFallback>
                    {applicantData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{applicantData.name}</h3>
                <p className="text-gray-600 text-sm">{applicantData.role}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{applicantData.rating}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">Applied Jobs</p>
                  <p className="font-medium">{applicantData.appliedJob}</p>
                  <p className="text-gray-500 text-xs">{applicantData.appliedDate}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-2">Stage</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 bg-blue-600 rounded-full flex-1"></div>
                    <span className="text-xs text-blue-600">{applicantData.stage}</span>
                  </div>
                  <Progress value={applicantData.stageProgress} className="h-2" />
                </div>

                <Button 
                  className="w-full bg-teal-600 text-white" 
                  size="sm"
                  onClick={handleScheduleInterview}
                  disabled={scheduleInterviewMutation.isPending}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {scheduleInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{applicantData.contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{applicantData.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Instagram className="h-4 w-4 text-gray-400" />
                <span>{applicantData.contact.instagram}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Twitter className="h-4 w-4 text-gray-400" />
                <span>{applicantData.contact.twitter}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-gray-400" />
                <span>{applicantData.contact.website}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Applicant Profile</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="progress">Hiring Progress</TabsTrigger>
              <TabsTrigger value="schedule">Interview Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="space-y-6">
                {/* Current Stage */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Current Stage</CardTitle>
                    <Button variant="outline" size="sm">
                      Give Rating
                    </Button>
                  </CardHeader>
                  <CardContent>
                                          <div className="flex items-center gap-4 mb-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Badge 
                              className={`cursor-pointer ${applicantData.stage === "Applied" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}
                            >
                              Applied
                            </Badge>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Update Application Stage</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to move this application to the "Applied" stage?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStageUpdate("Applied")}>
                                Update Stage
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Badge 
                              className={`cursor-pointer ${applicantData.stage === "Review" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-600"}`}
                            >
                              Review
                            </Badge>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Update Application Stage</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to move this application to the "Review" stage?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStageUpdate("Review")}>
                                Update Stage
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Badge 
                              className={`cursor-pointer ${applicantData.stage === "Shortlisted" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"}`}
                            >
                              Shortlisted
                            </Badge>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Update Application Stage</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to move this application to the "Shortlisted" stage?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStageUpdate("Shortlisted")}>
                                Update Stage
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Badge 
                              className={`cursor-pointer ${applicantData.stage === "Interview" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}
                            >
                              Interview
                            </Badge>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Update Application Stage</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to move this application to the "Interview" stage?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStageUpdate("Interview")}>
                                Update Stage
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Badge 
                              className={`cursor-pointer ${applicantData.stage === "Hired" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                            >
                              Hired
                            </Badge>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Update Application Stage</AlertDialogTitle>
                              <AlertDialogDescription>
                                <AlertDialogDescription>
                                  Are you sure you want to move this application to the "Hired" stage?
                                </AlertDialogDescription>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStageUpdate("Hired")}>
                                Update Stage
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Stage Info</p>
                        <p>Current Stage</p>
                        <p className="font-medium">{applicantData.stage}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stage Progress</p>
                        <p className="text-blue-600">{applicantData.stageProgress}%</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-600">Assigned to</span>
                          <div className="flex -space-x-2">
                            {applicantData.assignedTo.map((person: any, index: number) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={person.avatar} />
                                <AvatarFallback>{person.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Personal Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Full Name</p>
                        <p className="font-medium">{applicantData.personalInfo.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gender</p>
                        <p className="font-medium">{applicantData.personalInfo.gender}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date of Birth</p>
                        <p className="font-medium">{applicantData.personalInfo.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Language</p>
                        <p className="font-medium">{applicantData.personalInfo.language}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Address</p>
                        <p className="font-medium">{applicantData.personalInfo.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Professional Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">About Me</p>
                      <p className="text-sm">{applicantData.professionalInfo.aboutMe}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Experience</p>
                      <p className="text-sm">{applicantData.professionalInfo.experience}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Current Job</p>
                        <p className="font-medium">{applicantData.professionalInfo.currentJob}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Experience in Years</p>
                        <p className="font-medium">{applicantData.professionalInfo.experienceYears}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Highest Qualification Held</p>
                        <p className="font-medium">{applicantData.professionalInfo.education}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Skill set</p>
                        <div className="flex gap-2 mt-1">
                          {applicantData.professionalInfo.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Notes</CardTitle>
                    <Button variant="outline" size="sm">
                      Add Notes
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applicantData.notes.map((note: any) => (
                      <div key={note.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/professional-headshot-kathryn-murphy.png" />
                          <AvatarFallback>MK</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{note.author}</span>
                            <span className="text-xs text-gray-500">{note.date}</span>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                          {note.replies && (
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-600">
                              {note.replies} Replies
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              <Card>
                <CardContent className="p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-bold">{applicantData.name}</h1>
                      <p className="text-lg text-gray-600">{applicantData.role}</p>
                      <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{applicantData.contact.email}</span>
                        <span>{applicantData.contact.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h2 className="text-lg font-semibold mb-3 border-b pb-1">About Me</h2>
                        <p className="text-sm leading-relaxed">{applicantData.professionalInfo.aboutMe}</p>
                      </section>

                      <section>
                        <h2 className="text-lg font-semibold mb-3 border-b pb-1">Work Experience</h2>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">Current Position</h3>
                            <p className="text-sm text-gray-600">{applicantData.professionalInfo.currentJob} • {applicantData.professionalInfo.experienceYears}</p>
                            <p className="text-sm mt-2">{applicantData.professionalInfo.experience}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-lg font-semibold mb-3 border-b pb-1">Education</h2>
                        <div>
                          <h3 className="font-medium">{applicantData.professionalInfo.education}</h3>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-lg font-semibold mb-3 border-b pb-1">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {applicantData.professionalInfo.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {/* Stage Info Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Stage Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    <div>
                      <p className="text-gray-500">Current Stage</p>
                      <p className="font-medium text-gray-900">{applicantData.stage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stage Progress</p>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-semibold px-2 py-1 text-xs rounded-full">
                        {applicantData.stageProgress}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">Applied Date</p>
                      <p className="font-medium text-gray-900">{applicantData.appliedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned to</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {applicantData.assignedTo.map((person: any, index: number) => (
                          <Avatar key={index} className="h-8 w-8">
                            <AvatarImage src={person.avatar} alt={person.name} />
                            <AvatarFallback>{person.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl py-3 text-base"
                      disabled={updateStageMutation.isPending}
                    >
                      {updateStageMutation.isPending ? "Updating..." : "Move to Next Step"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Move to Next Stage</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to move this application to the next stage: "{getNextStage(applicantData.stage)}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStageUpdate(getNextStage(applicantData.stage))}>
                        Move to Next Stage
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Separator className="my-6" />

                {/* Notes Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Notes</h2>
                    {/* Popover for Add Notes */}
                    <Popover open={isNotePopoverOpen} onOpenChange={setIsNotePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 font-semibold">
                          <Plus className="h-4 w-4 mr-1" /> Add Notes
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-4 bg-white rounded-lg shadow-lg">
                        <Textarea
                          placeholder="Write your note here..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="mb-2"
                          rows={4}
                        />
                        <Button onClick={handleAddNote} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                          Submit
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* List of notes */}
                  {notes.map((note) => (
                    <div key={note.id} className="flex space-x-3 mb-4 last:mb-0 items-start">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={note.avatar} alt={note.author} />
                        <AvatarFallback>{note.author.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">{note.author}</span>
                          <span className="text-xs text-gray-500">{note.date} • {note.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{note.text}</p>
                        {note.replies > 0 && (
                          <span className="text-xs text-teal-600 font-medium">
                            {note.replies} {note.replies === 1 ? "Reply" : "Replies"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Interview List</CardTitle>
                  <Button 
                    className="bg-teal-600 text-white" 
                    size="sm"
                    onClick={handleScheduleInterview}
                    disabled={scheduleInterviewMutation.isPending}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {scheduleInterviewMutation.isPending ? "Scheduling..." : "Add Schedule Interview"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applicantData.interviews.map((interview: any) => (
                      <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/professional-headshot-kathryn-murphy.png" />
                            <AvatarFallback>
                              {interview.interviewer
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{interview.interviewer}</p>
                            <p className="text-sm text-gray-600">{interview.date}</p>
                            <p className="text-sm text-gray-600">{interview.time}</p>
                            <p className="text-sm text-gray-600">{interview.location}</p>
                          </div>
                        </div>
                        <Button className="text-teal-400" variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Feedback
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function getNextStage(currentStage: string): string {
  const stages = ["Applied", "Review", "Shortlisted", "Interview", "Hired"]
  const currentIndex = stages.indexOf(currentStage)
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : currentStage
}
