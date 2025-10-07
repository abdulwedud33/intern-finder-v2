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
import { useUploadProfilePhoto, useUploadResume } from "@/hooks/useFileUpload"
import { useMyProfile, useUpdateProfile, useUploadProfilePicture, useUploadResume as useUploadResumeProfile } from "@/hooks/useInternProfile"
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload"
import { ImageUpload } from "@/components/ui/image-upload"
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
  const { user, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Real data hooks
  const { data: profileData, isLoading: profileLoading, error: profileError } = useMyProfile()
  const updateProfileMutation = useUpdateProfile()
  const uploadProfilePhotoMutation = useUploadProfilePicture()
  const uploadResumeMutation = useUploadResumeProfile()

  const handleProfilePhotoUpload = (file: File) => {
    uploadProfilePhotoMutation.mutate(file)
  }

  const handleResumeUpload = (file: File) => {
    uploadResumeMutation.mutate(file)
  }

  // Handle profile updates
  const handleUpdateProfile = (updatedData: any) => {
    updateProfileMutation.mutate(updatedData, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  if (authLoading || profileLoading) return <LoadingPage />
  if (profileError) return <ErrorPage error={{ message: profileError.toString() }} />
  if (!profileData?.data) return <ErrorPage error={{ message: 'Profile not found' }} />

  const profile: any = profileData.data

  // Transform backend data to match frontend expectations
  const transformedProfile: any = {
    name: profile.name || user?.name || "John Doe",
    email: profile.email || user?.email || "john.doe@example.com",
    title: profile.headline || "Frontend Developer",
    location: profile.location || "San Francisco, CA",
    bio: profile.bio || "Passionate frontend developer with 3+ years of experience building modern web applications. I love creating beautiful, responsive interfaces that provide exceptional user experiences.",
    profilePicture: profile.avatar || user?.avatar || "/placeholder-user.jpg",
    coverImage: "/images/hero-section-bg.jpg",
    skills: profile.skills?.map((skill: any) => skill.name) || ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "Python", "Figma", "Git"],
    experiences: profile.experience?.map((exp: any, index: number) => ({
      id: exp._id || index + 1,
      title: exp.title,
      company: exp.company,
      duration: `${new Date(exp.startDate).getFullYear()} - ${exp.isCurrent ? 'Present' : new Date(exp.endDate || '').getFullYear()}`,
      description: exp.description || "",
      type: "Full-time"
    })) || [],
    education: profile.education?.map((edu: any, index: number) => ({
      id: edu._id || index + 1,
      degree: edu.degree,
      school: edu.institution,
      year: `${new Date(edu.startDate).getFullYear()} - ${edu.isCurrent ? 'Present' : new Date(edu.endDate || '').getFullYear()}`,
      gpa: edu.gpa?.toString() || "3.8"
    })) || [],
    projects: [], // Projects would need to be added to the backend model
    socialLinks: {
      linkedin: profile.social?.linkedin || profile.linkedinUrl || "https://linkedin.com/in/johndoe",
      github: profile.social?.github || profile.githubUrl || "https://github.com/johndoe",
      portfolio: profile.portfolioUrl || "https://johndoe.dev",
      twitter: profile.social?.twitter || "https://twitter.com/johndoe"
    },
    stats: {
      profileViews: 1247, // This would come from analytics API
      applications: 23, // This would come from applications API
      interviews: 8, // This would come from interviews API
      offers: 3 // This would come from applications API
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Cover Image & Profile Header */}
      <div className="relative">
        <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <Image
            src={transformedProfile.coverImage}
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
                    src={transformedProfile.profilePicture} 
                    alt={transformedProfile.name}
                  className="object-cover"
                />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {transformedProfile.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Dialog>
                <DialogTrigger asChild>
              <Button
                size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
              >
                    <Camera className="h-4 w-4 text-gray-600" />
              </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Profile Photo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ImageUpload
                      type="profile"
                      currentImage={transformedProfile.profilePicture}
                      showPreview={true}
                    />
                    <p className="text-sm text-gray-500">
                      Upload a professional photo. Max size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

              {/* Profile Details */}
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{transformedProfile.name}</h1>
                    <p className="text-xl text-blue-100 mb-2">{transformedProfile.title}</p>
                    <div className="flex items-center gap-2 text-blue-100">
                      <MapPin className="h-4 w-4" />
                      <span>{transformedProfile.location}</span>
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
                  <div className="text-2xl font-bold text-blue-600">{transformedProfile.stats.profileViews}</div>
                  <div className="text-sm text-gray-600">Profile Views</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-green-600">{transformedProfile.stats.applications}</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-purple-600">{transformedProfile.stats.interviews}</div>
                  <div className="text-sm text-gray-600">Interviews</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-orange-600">{transformedProfile.stats.offers}</div>
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
                      <p className="text-gray-700 leading-relaxed">{transformedProfile.bio}</p>
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
                        {transformedProfile.skills.map((skill: string, index: number) => (
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
                      {transformedProfile.experiences.map((exp: any) => (
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
                        {transformedProfile.projects.map((project: any) => (
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
                                {project.tech.map((tech: string, index: number) => (
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
                      {transformedProfile.education.map((edu: any) => (
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
                    <a href={`mailto:${transformedProfile.email}`} className="text-sm text-blue-600 hover:underline">
                      {transformedProfile.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">{transformedProfile.location}</span>
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
                  {Object.entries(transformedProfile.socialLinks).map(([platform, url]: [string, any]) => (
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
            <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                    <EnhancedFileUpload
                      onFileUploaded={(fileUrl, filename) => {
                        // File is automatically uploaded and profile updated
                        toast.success("Resume updated successfully!")
                      }}
                      currentFile={transformedProfile.resume}
                      fileType="resume"
                      maxSize={10}
                      showPreview={false}
                      showDownload={true}
                      showDelete={true}
                      accept=".pdf,.doc,.docx"
                      disabled={uploadResumeMutation.isPending}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your latest resume. Max size: 10MB
                    </p>
                  </div>
                  
                  <div className="space-y-2">
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
                </div>
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

      {/* Profile Editing Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileEditForm 
            profile={profile} 
            onSave={handleUpdateProfile}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Profile Edit Form Component
function ProfileEditForm({ profile, onSave, onCancel }: { 
  profile: any; 
  onSave: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    social: {
      github: profile.social?.github || '',
      linkedin: profile.social?.linkedin || '',
      twitter: profile.social?.twitter || ''
    },
    skills: profile.skills?.map((s: any) => s.name) || [],
    education: profile.education || [],
    experience: profile.experience || []
  })

  const [newSkill, setNewSkill] = useState('')
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    gpa: ''
  })
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform data for backend
    const updateData = {
      ...formData,
      skills: formData.skills.map((skill: string) => ({ name: skill, level: 'intermediate' })),
      education: formData.education,
      experience: formData.experience
    }
    
    onSave(updateData)
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((skill: string) => skill !== skillToRemove)
    }))
  }

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.fieldOfStudy) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, gpa: parseFloat(newEducation.gpa) || undefined }]
      }))
      setNewEducation({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        gpa: ''
      })
    }
  }

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience]
      }))
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="e.g., Frontend Developer"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={formData.social.github}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social: { ...prev.social, github: e.target.value }
              }))}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.social.linkedin}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social: { ...prev.social, linkedin: e.target.value }
              }))}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={formData.social.twitter}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social: { ...prev.social, twitter: e.target.value }
              }))}
              placeholder="https://twitter.com/username"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <Button type="button" onClick={addSkill}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill: string, index: number) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {skill}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeSkill(skill)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  )
}