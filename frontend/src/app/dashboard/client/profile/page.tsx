"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, 
  Users, 
  Calendar, 
  Settings, 
  Edit, 
  Save, 
  X, 
  Upload,
  Building2,
  Phone,
  Mail,
  Link as LinkIcon,
  CheckCircle,
  TrendingUp,
  Eye,
  Briefcase,
  Star,
  Award,
  Target,
  Clock,
  UserCheck,
  DollarSign,
  MapPin
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useUploadCompanyLogo } from "@/hooks/useFileUpload"
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser } from "@/services/authService"
import { jobService } from "@/services/jobService"
import { applicationService } from "@/services/applicationService"
import { interviewService } from "@/services/interviewService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CompanyProfile } from "@/types/auth"

interface ProfileFormData {
  name: string
  description: string
  website: string
  industry: string
  companySize: string
  headquarters: string
  phone: string
  founded: string
  employees: string
  socialMedia: {
    linkedin: string
    twitter: string
    facebook: string
    instagram: string
    youtube: string
  }
}

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 
  'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Other'
]

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees', 
  '201-500 employees', '501-1000 employees', '1000+ employees'
]

export default function ClientProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch current user data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!user,
  })

  // Fetch company jobs data
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['companyJobs'],
    queryFn: () => jobService.getJobsByCompany(user?.id || '', { limit: 50 }),
    enabled: !!user && user.role === 'company',
  })

  // Fetch company applications data
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['companyApplications'],
    queryFn: () => applicationService.getCompanyApplications({ limit: 50 }),
    enabled: !!user && user.role === 'company',
  })

  // Fetch company interviews data
  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ['companyInterviews'],
    queryFn: () => interviewService.getCompanyInterviews(user?.id || ''),
    enabled: !!user && user.role === 'company',
  })

  // Fetch company stats data
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['companyStats'],
    queryFn: async () => {
      // Get job views from jobs data
      const jobViews = jobsData?.data?.reduce((total: number, job: any) => total + (job.views || 0), 0) || 0
      
      return {
        totalJobs: jobsData?.data?.length || 0,
        activeJobs: jobsData?.data?.filter((job: any) => job.status === 'active').length || 0,
        totalApplications: Array.isArray(applicationsData?.data) ? applicationsData.data.length : 0,
        interviewsScheduled: Array.isArray(interviewsData?.data) ? interviewsData.data.filter((interview: any) => 
          interview.status === 'scheduled' || interview.status === 'pending'
        ).length : 0,
        hiredInterns: Array.isArray(applicationsData?.data) ? applicationsData.data.filter((app: any) => 
          app.status === 'accepted'
        ).length : 0,
        profileViews: jobViews, // Using job views as proxy for profile engagement
        avgRating: 4.7 // This would need a separate API endpoint for reviews
      }
    },
    enabled: !!user && user.role === 'company' && !!jobsData && !!applicationsData && !!interviewsData,
  })
  
  const uploadLogoMutation = useUploadCompanyLogo()

  const handleLogoUpload = (file: File) => {
    uploadLogoMutation.mutate(file)
  }

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    description: "",
    website: "",
    industry: "",
    companySize: "",
    headquarters: "",
    phone: "",
    founded: "",
    employees: "",
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      youtube: ""
    }
  })

  // Type guard to check if user is a company
  const isCompany = (user: any): user is CompanyProfile => {
    return user && user.role === 'company'
  }


  // Update form data when user data loads
  useEffect(() => {
    if (userData && isCompany(userData)) {
      setFormData({
        name: userData.name || "",
        description: userData.description || "",
        website: userData.website || "",
        industry: userData.industry || "",
        companySize: userData.companySize || "",
        headquarters: userData.headquarters || "",
        phone: userData.phone || "",
        founded: userData.founded?.toString() || "",
        employees: userData.employees || "",
        socialMedia: {
          linkedin: userData.socialMedia?.linkedin || "",
          twitter: userData.socialMedia?.twitter || "",
          facebook: userData.socialMedia?.facebook || "",
          instagram: userData.socialMedia?.instagram || "",
          youtube: userData.socialMedia?.youtube || ""
        }
      })
    }
  }, [userData])

  // Mock update profile mutation (replace with actual API call)
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" })
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" })
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({ title: "Logo uploaded successfully" })
    } catch (error) {
      toast({ title: "Failed to upload logo", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0
    
    const fields = [
      profile.name,
      profile.description,
      profile.website,
      profile.industry,
      profile.companySize,
      profile.headquarters,
      profile.phone,
      profile.founded,
      profile.logo,
      profile.socialMedia?.linkedin || profile.socialMedia?.twitter
    ]
    
    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }

  // Use real company stats from backend data
  const companyStats = statsData || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiredInterns: 0,
    profileViews: 0,
    avgRating: 4.7
  }

  if (isLoading) {
    return <LoadingCard />
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load profile" />
  }

  const profile = userData && isCompany(userData) ? userData : null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.logo} alt={profile?.name} />
                  <AvatarFallback className="bg-teal-500 text-white text-2xl">
                    {profile?.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        disabled={uploadLogoMutation.isPending}
                      >
                        {uploadLogoMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Company Logo</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <EnhancedFileUpload
                          onFileUploaded={(fileUrl, filename) => {
                            // File is automatically uploaded and profile updated
                            toast({
                              title: "Company logo updated successfully!",
                              description: "Your company logo has been updated."
                            })
                          }}
                          currentFile={profile?.logo}
                          fileType="company-logo"
                          maxSize={5}
                          showPreview={true}
                          showDownload={true}
                          showDelete={true}
                          accept="image/*"
                          disabled={uploadLogoMutation.isPending}
                        />
                        <p className="text-sm text-gray-500">
                          Upload your company logo. Max size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="text-3xl font-bold border-none p-0 h-auto"
                          placeholder="Company name"
                        />
                      ) : (
                        profile?.name || "Company Name"
                      )}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      {profile?.industry && (
                        <Badge variant="secondary" className="text-sm">
                          {profile.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {profile?.website && (
                  <div className="flex items-center gap-2 text-teal-600 mb-4">
                    <Globe className="h-4 w-4" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  {profile?.founded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {profile.founded}</span>
                    </div>
                  )}
                  {profile?.employees && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{profile.employees}</span>
                    </div>
                  )}
                  {profile?.headquarters && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.headquarters}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={updateProfileMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About {profile?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Tell us about your company..."
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.description || "No description provided."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    {isEditing ? (
                      <select
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleInputChange("industry", e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-700">{profile?.industry || "Not specified"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    {isEditing ? (
                      <select
                        id="companySize"
                        value={formData.companySize}
                        onChange={(e) => handleInputChange("companySize", e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select size</option>
                        {companySizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-700">{profile?.companySize || "Not specified"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="founded">Founded</Label>
                    {isEditing ? (
                      <Input
                        id="founded"
                        type="number"
                        value={formData.founded}
                        onChange={(e) => handleInputChange("founded", e.target.value)}
                        placeholder="Year founded"
                      />
                    ) : (
                      <p className="text-gray-700">{profile?.founded || "Not specified"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    {isEditing ? (
                      <Input
                        id="headquarters"
                        value={formData.headquarters}
                        onChange={(e) => handleInputChange("headquarters", e.target.value)}
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-gray-700">{profile?.headquarters || "Not specified"}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs & Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recent Jobs & Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Jobs */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Job Postings</h4>
                    {jobsLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : jobsData?.data && jobsData.data.length > 0 ? (
                      <div className="space-y-3">
                        {jobsData.data.slice(0, 3).map((job: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{job.title}</p>
                                <p className="text-xs text-gray-500">
                                  {job.applications?.length || 0} applications
                                </p>
                              </div>
                              <Badge 
                                variant={job.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          View All Jobs
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No job postings yet</p>
                    )}
                  </div>

                  {/* Recent Applications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Applications</h4>
                    {applicationsLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : Array.isArray(applicationsData?.data) && applicationsData.data.length > 0 ? (
                      <div className="space-y-3">
                        {applicationsData.data.slice(0, 3).map((app: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {app.internId?.name || 'Unknown Intern'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Applied to {app.jobId?.title || 'Unknown Job'}
                                </p>
                              </div>
                              <Badge 
                                variant={
                                  app.status === 'accepted' ? 'default' : 
                                  app.status === 'rejected' ? 'destructive' : 
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {app.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          View All Applications
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No applications yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviewsLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : Array.isArray(interviewsData?.data) && interviewsData.data.length > 0 ? (
                  <div className="space-y-3">
                    {interviewsData.data
                      .filter((interview: any) => 
                        interview.status === 'scheduled' || interview.status === 'pending'
                      )
                      .slice(0, 3)
                      .map((interview: any, index: number) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {interview.internId?.name || 'Unknown Intern'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {interview.jobId?.title || 'Unknown Job'}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {interview.scheduledDate ? 
                                new Date(interview.scheduledDate).toLocaleDateString() : 
                                'Date TBD'
                              }
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {interview.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View All Interviews
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No scheduled interviews</p>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Contact & Social */}
          <div className="space-y-6">
            {/* Company Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Company Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{companyStats.hiredInterns}</div>
                    <div className="text-sm text-gray-600">Hired Interns</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{companyStats.interviewsScheduled}</div>
                    <div className="text-sm text-gray-600">Interviews</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Company Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold">{companyStats.avgRating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <UserCheck className="h-4 w-4 mr-2" />
                    View All Hires
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Manage Interviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4" />
                    <span>{profile?.email}</span>
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4" />
                      <span>{profile?.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://example.com"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Globe className="h-4 w-4" />
                      <span>{profile?.website || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label>LinkedIn</Label>
                      <Input
                        value={formData.socialMedia.linkedin}
                        onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/company/your-company"
                      />
                    </div>
                    <div>
                      <Label>Twitter</Label>
                      <Input
                        value={formData.socialMedia.twitter}
                        onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                        placeholder="https://twitter.com/your-username"
                      />
                    </div>
                    <div>
                      <Label>Facebook</Label>
                      <Input
                        value={formData.socialMedia.facebook}
                        onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                        placeholder="https://facebook.com/your-page"
                      />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={formData.socialMedia.instagram}
                        onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                        placeholder="https://instagram.com/your-username"
                      />
                    </div>
                    <div>
                      <Label>YouTube</Label>
                      <Input
                        value={formData.socialMedia.youtube}
                        onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                        placeholder="https://youtube.com/your-channel"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.socialMedia?.linkedin && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-600" />
                        <a
                          href={profile.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {profile?.socialMedia?.twitter && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-400" />
                        <a
                          href={profile.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Twitter
                        </a>
                      </div>
                    )}
                    {profile?.socialMedia?.facebook && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-800" />
                        <a
                          href={profile.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-800 hover:underline"
                        >
                          Facebook
                        </a>
                      </div>
                    )}
                    {profile?.socialMedia?.instagram && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-pink-600" />
                        <a
                          href={profile.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:underline"
                        >
                          Instagram
                        </a>
                      </div>
                    )}
                    {profile?.socialMedia?.youtube && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-red-600" />
                        <a
                          href={profile.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline"
                        >
                          YouTube
                        </a>
                      </div>
                    )}
                    {!profile?.socialMedia?.linkedin && !profile?.socialMedia?.twitter && 
                     !profile?.socialMedia?.facebook && !profile?.socialMedia?.instagram && 
                     !profile?.socialMedia?.youtube && (
                      <p className="text-gray-500 italic">No social media links</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Stats - Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Profile Completion */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateProfileCompletion(profile)}%
                  </p>
                </div>
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-gray-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${calculateProfileCompletion(profile)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <CheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{companyStats.activeJobs}</p>
                  )}
                </div>
                <Briefcase className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Applications */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{companyStats.totalApplications}</p>
                  )}
                </div>
                <TrendingUp className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          {/* Profile Views */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{companyStats.profileViews}</p>
                  )}
                </div>
                <Eye className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}