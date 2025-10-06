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
  MapPin, 
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
  Plus,
  Trash2,
  CheckCircle,
  TrendingUp,
  Eye,
  Briefcase,
  Star,
  Award,
  Target,
  Activity
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useUploadCompanyLogo } from "@/hooks/useFileUpload"
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser } from "@/services/authService"
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
  techStack: string[]
  officeLocations: Array<{
    address: string
    city: string
    country: string
    isHeadquarters: boolean
  }>
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
  const [newTech, setNewTech] = useState("")
  const [newOffice, setNewOffice] = useState({
    address: "",
    city: "",
    country: "",
    isHeadquarters: false
  })

  // Fetch current user data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!user,
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
    techStack: [],
    officeLocations: [],
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
        techStack: userData.techStack || [],
        officeLocations: (userData.officeLocations || []).map(loc => ({
          ...loc,
          isHeadquarters: loc.isHeadquarters || false
        })),
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

  const handleAddTech = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()]
      }))
      setNewTech("")
    }
  }

  const handleRemoveTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }))
  }

  const handleAddOffice = () => {
    if (newOffice.address && newOffice.city && newOffice.country) {
      setFormData(prev => ({
        ...prev,
        officeLocations: [...prev.officeLocations, { ...newOffice }]
      }))
      setNewOffice({ address: "", city: "", country: "", isHeadquarters: false })
    }
  }

  const handleRemoveOffice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      officeLocations: prev.officeLocations.filter((_, i) => i !== index)
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
      profile.techStack?.length > 0,
      profile.officeLocations?.length > 0,
      profile.socialMedia?.linkedin || profile.socialMedia?.twitter
    ]
    
    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }

  // Mock company stats (replace with real data)
  const companyStats = {
    totalJobs: 12,
    activeJobs: 8,
    totalApplications: 156,
    interviewsScheduled: 23,
    hiredInterns: 5,
    profileViews: 89,
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

        {/* Profile Completion & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Profile Completion */}
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">Profile Completion</p>
                  <p className="text-2xl font-bold text-teal-900">
                    {calculateProfileCompletion(profile)}%
                  </p>
                </div>
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-teal-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-teal-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${calculateProfileCompletion(profile)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <CheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Active Jobs</p>
                  <p className="text-2xl font-bold text-blue-900">{companyStats.activeJobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Applications */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Applications</p>
                  <p className="text-2xl font-bold text-green-900">{companyStats.totalApplications}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Profile Views */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Profile Views</p>
                  <p className="text-2xl font-bold text-purple-900">{companyStats.profileViews}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
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

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add technology"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                      />
                      <Button onClick={handleAddTech} disabled={!newTech.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <button
                            onClick={() => handleRemoveTech(tech)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.techStack?.length ? (
                      profile.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary">{tech}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No technologies listed</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Office Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={newOffice.address}
                        onChange={(e) => setNewOffice(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Address"
                      />
                      <Input
                        value={newOffice.city}
                        onChange={(e) => setNewOffice(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                      <Input
                        value={newOffice.country}
                        onChange={(e) => setNewOffice(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Country"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newOffice.isHeadquarters}
                          onCheckedChange={(checked) => setNewOffice(prev => ({ ...prev, isHeadquarters: checked }))}
                        />
                        <Label>Headquarters</Label>
                      </div>
                    </div>
                    <Button onClick={handleAddOffice} disabled={!newOffice.address || !newOffice.city || !newOffice.country}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                    <div className="space-y-2">
                      {formData.officeLocations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {location.address}, {location.city}, {location.country}
                              {location.isHeadquarters && " (HQ)"}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOffice(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.officeLocations?.length ? (
                      profile.officeLocations.map((location, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {location.address}, {location.city}, {location.country}
                            {location.isHeadquarters && " (HQ)"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No office locations listed</p>
                    )}
                  </div>
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
                <div className="text-center">
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    View Analytics
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
                        placeholder="company-name"
                      />
                    </div>
                    <div>
                      <Label>Twitter</Label>
                      <Input
                        value={formData.socialMedia.twitter}
                        onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                        placeholder="@company"
                      />
                    </div>
                    <div>
                      <Label>Facebook</Label>
                      <Input
                        value={formData.socialMedia.facebook}
                        onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                        placeholder="company-page"
                      />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={formData.socialMedia.instagram}
                        onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                        placeholder="@company"
                      />
                    </div>
                    <div>
                      <Label>YouTube</Label>
                      <Input
                        value={formData.socialMedia.youtube}
                        onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                        placeholder="@company"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.socialMedia?.linkedin && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-600" />
                        <a
                          href={`https://linkedin.com/company/${profile.socialMedia.linkedin}`}
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
                          href={`https://twitter.com/${profile.socialMedia.twitter}`}
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
                          href={`https://facebook.com/${profile.socialMedia.facebook}`}
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
                          href={`https://instagram.com/${profile.socialMedia.instagram}`}
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
                          href={`https://youtube.com/${profile.socialMedia.youtube}`}
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

        {/* Recent Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock recent activities */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New job posting published</p>
                  <p className="text-xs text-gray-500">Frontend Developer Intern - 2 hours ago</p>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">15 new applications received</p>
                  <p className="text-xs text-gray-500">Software Engineer Intern - 5 hours ago</p>
                </div>
                <Badge variant="secondary" className="text-xs">15</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Interview scheduled</p>
                  <p className="text-xs text-gray-500">With John Doe - Tomorrow at 2:00 PM</p>
                </div>
                <Badge variant="outline" className="text-xs">Scheduled</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile viewed by 8 interns</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <Badge variant="outline" className="text-xs">8 views</Badge>
              </div>
              
              <div className="text-center pt-4">
                <Button variant="ghost" size="sm">
                  View All Activity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}