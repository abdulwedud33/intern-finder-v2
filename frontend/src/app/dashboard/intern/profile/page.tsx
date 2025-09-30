"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Linkedin, 
  Edit, 
  Plus, 
  X, 
  Download,
  Share2,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Camera,
  Globe,
  Calendar,
  User,
  Settings,
  Heart,
  MessageCircle,
  ExternalLink
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { user, loading, error } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Mock data for demonstration - replace with real data from hooks
  const profileData = {
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    title: "Frontend Developer",
    location: "San Francisco, CA",
    bio: "Passionate frontend developer with 3+ years of experience building modern web applications. I love creating beautiful, responsive interfaces that provide exceptional user experiences.",
    profilePicture: user?.profilePicture || "/placeholder-user.jpg",
    coverImage: "/images/hero-section-bg.jpg",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "Python", "Figma", "Git"],
    experiences: [
      {
        id: 1,
        title: "Frontend Developer",
        company: "TechCorp Inc.",
        duration: "2022 - Present",
        description: "Led development of responsive web applications using React and TypeScript. Collaborated with design team to implement pixel-perfect UIs.",
        type: "Full-time"
      },
      {
        id: 2,
        title: "Junior Developer",
        company: "StartupXYZ",
        duration: "2021 - 2022",
        description: "Developed and maintained web applications using modern JavaScript frameworks. Worked closely with senior developers to learn best practices.",
        type: "Full-time"
      }
    ],
    education: [
      {
        id: 1,
        degree: "Bachelor of Computer Science",
        school: "University of California",
        year: "2017 - 2021",
        gpa: "3.8"
      }
    ],
    projects: [
      {
        id: 1,
        name: "E-commerce Platform",
        description: "Full-stack e-commerce solution with React, Node.js, and MongoDB",
        tech: ["React", "Node.js", "MongoDB", "Stripe"],
        image: "/web-design-portfolio.png",
        link: "https://github.com/johndoe/ecommerce"
      },
      {
        id: 2,
        name: "Task Management App",
        description: "Collaborative task management tool with real-time updates",
        tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
        image: "/mobile-app-design-concept.png",
        link: "https://github.com/johndoe/taskapp"
      }
    ],
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      portfolio: "https://johndoe.dev",
      twitter: "https://twitter.com/johndoe"
    },
    stats: {
      profileViews: 1247,
      applications: 23,
      interviews: 8,
      offers: 3
    }
  }

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage error={{ message: error.toString() }} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Cover Image & Profile Header */}
      <div className="relative">
        <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <Image
            src={profileData.coverImage}
            alt="Cover"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

        {/* Profile Info Overlay */}
        <div className="relative -mt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
            <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                <AvatarImage 
                    src={profileData.profilePicture} 
                    alt={profileData.name}
                  className="object-cover"
                />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
              >
                  <Camera className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

              {/* Profile Details */}
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                    <p className="text-xl text-blue-100 mb-2">{profileData.title}</p>
                    <div className="flex items-center gap-2 text-blue-100">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
              </div>
              
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-blue-600">{profileData.stats.profileViews}</div>
                  <div className="text-sm text-gray-600">Profile Views</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-green-600">{profileData.stats.applications}</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-purple-600">{profileData.stats.interviews}</div>
                  <div className="text-sm text-gray-600">Interviews</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-orange-600">{profileData.stats.offers}</div>
                  <div className="text-sm text-gray-600">Offers</div>
                </Card>
              </div>
              
              {/* Tabs Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* About Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        About Me
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
            </CardContent>
          </Card>

                  {/* Skills Section */}
          <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Skills & Technologies
                      </CardTitle>
            </CardHeader>
            <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
            </CardContent>
          </Card>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Work Experience
                      </CardTitle>
                      <Button size="sm" onClick={() => setIsAddingExperience(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                  </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {profileData.experiences.map((exp) => (
                        <div key={exp.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                      <div>
                              <h3 className="font-semibold text-lg">{exp.title}</h3>
                              <p className="text-blue-600 font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500">{exp.duration}</p>
                              <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                      </div>
                            <Badge variant="outline">{exp.type}</Badge>
                      </div>
                    </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Featured Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profileData.projects.map((project) => (
                          <div key={project.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video relative">
                              <Image
                                src={project.image}
                                alt={project.name}
                                fill
                                className="object-cover"
                        />
                      </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                              <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {project.tech.map((tech, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Project
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                      {profileData.education.map((edu) => (
                        <div key={edu.id} className="border-l-4 border-green-500 pl-4 py-2">
                          <h3 className="font-semibold text-lg">{edu.degree}</h3>
                          <p className="text-green-600 font-medium">{edu.school}</p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
                          <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
                      </div>
                      
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <a href={`mailto:${profileData.email}`} className="text-sm text-blue-600 hover:underline">
                      {profileData.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">{profileData.location}</span>
                </div>
            </CardContent>
          </Card>

              {/* Social Links */}
          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Links
                  </CardTitle>
            </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(profileData.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                      {platform === 'github' && <Code className="h-4 w-4" />}
                      {platform === 'portfolio' && <Globe className="h-4 w-4" />}
                      {platform === 'twitter' && <MessageCircle className="h-4 w-4" />}
                      <span className="capitalize">{platform}</span>
                    </a>
                  ))}
            </CardContent>
          </Card>

              {/* Profile Completion */}
          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Profile Completion
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Profile Strength</span>
                      <span className="font-medium">85%</span>
                </div>
                    <Progress value={85} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Complete your profile to increase visibility
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Quick Actions */}
          <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
              </Button>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Experience Dialog */}
      <Dialog open={isAddingExperience} onOpenChange={setIsAddingExperience}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" placeholder="e.g., Frontend Developer" />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="e.g., TechCorp Inc." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="month" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="month" placeholder="Leave empty if current" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your role and achievements..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingExperience(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddingExperience(false)}>
                Add Experience
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}