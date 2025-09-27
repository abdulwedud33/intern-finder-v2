"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Phone, Mail, Linkedin, Edit, Plus, X } from "lucide-react"
import Image from "next/image"
import {
  useInternProfile,
  useUpdateInternProfile,
  useAddExperience,
  useRemoveExperience
} from "@/hooks/useProfile"
import { useAuthUser } from "@/hooks/useAuth"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Experience } from "@/types/api"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    aboutMe: "",
    currentJob: "",
    education: "",
    skills: [] as string[],
    instagram: "",
    twitter: "",
    linkedin: ""
  })
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    type: "",
    startDate: "",
    endDate: "",
    description: "",
    location: ""
  })
  
  // Fetch data using React Query hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useInternProfile()
  const { data: authUser, isLoading: authLoading, error: authError } = useAuthUser()
  
  // Combine auth user data with profile data (flattened for browser response)
  const combinedProfile = {
    ...profile,
    name: authUser?.name || profile?.name,
    email: authUser?.email || profile?.email,
    location: authUser?.profile?.location || profile?.location,
    profilePictureUrl: authUser?.profile?.profilePictureUrl || profile?.profilePictureUrl,
    portfolios: authUser?.profile?.portfolio || profile?.portfolios,
    experiences: profile?.experiences || [],
    skills: profile?.skills || [],
  }
  
  // Mutations
  const updateProfileMutation = useUpdateInternProfile()
  const addExperienceMutation = useAddExperience()
  const removeExperienceMutation = useRemoveExperience()
  
  const isLoading = profileLoading || authLoading
  const error = profileError || authError
  
  if (isLoading) return <LoadingPage />
  if (error) return <ErrorPage error={error} />
  if (!profile) return <ErrorPage title="Profile not found" description="Unable to load your profile." />
  
  const experiences = Array.isArray(combinedProfile.experiences) ? combinedProfile.experiences : []
  const skills = Array.isArray(combinedProfile.skills) ? combinedProfile.skills : []

  const handleEdit = () => {
    setEditForm({
      name: combinedProfile.name || "",
      email: combinedProfile.email || "",
      phone: "", // Phone not available in current API response
      location: combinedProfile.location || "",
      aboutMe: combinedProfile.aboutMe || "",
      currentJob: combinedProfile.currentJob || "",
      education: combinedProfile.education || "",
      skills: Array.isArray(combinedProfile?.skills) ? combinedProfile.skills : [],
      instagram: combinedProfile.instagram || "",
      twitter: combinedProfile.twitter || "",
      linkedin: combinedProfile.linkedin || ""
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateProfileMutation.mutate(editForm, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      addExperienceMutation.mutate(newExperience, {
        onSuccess: () => {
          setIsAddingExperience(false)
          setNewExperience({
            title: "",
            company: "",
            type: "",
            startDate: "",
            endDate: "",
            description: "",
            location: combinedProfile.location || ""
          })
        }
      })
    }
  }

  const handleRemoveExperience = (experienceId: string) => {
    removeExperienceMutation.mutate(experienceId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
      </div>


      {/* Profile Header Card */}
      <Card className="relative overflow-hidden">
        <div className="h-33 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200"></div>
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={combinedProfile.profilePictureUrl && combinedProfile.profilePictureUrl !== "no-photo.jpg" ? combinedProfile.profilePictureUrl : undefined} 
                  alt={combinedProfile.name || "Profile"} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                  {combinedProfile.name ? combinedProfile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : "IN"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md hover:shadow-lg transition-shadow"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    {combinedProfile.name || (
                      <span className="text-gray-400 italic">Add your name</span>
                    )}
                  </h2>
                  {(combinedProfile.currentJob || combinedProfile.role || combinedProfile.position) ? (
                    <p className="text-gray-600">{combinedProfile.currentJob || combinedProfile.role || combinedProfile.position}</p>
                  ) : (
                    <p className="text-gray-400 italic text-sm">Add your current role</p>
                  )}
                  {combinedProfile.role && (
                    <Badge variant="secondary" className="mt-1">
                      {combinedProfile.role}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Additional Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Additional Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500" />
                {combinedProfile.email ? (
                  <a 
                    href={`mailto:${combinedProfile.email}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {combinedProfile.email}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 italic">Add your email</span>
                )}
              </div>
              
              {/* Phone number not available in current API response */}
              <div className="flex items-center gap-3 opacity-50">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400 italic">Phone number not available</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-red-500" />
                {combinedProfile.location ? (
                  <span className="text-sm text-gray-700">{combinedProfile.location}</span>
                ) : (
                  <span className="text-sm text-gray-400 italic">Add your location</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* About Me */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">About Me</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {combinedProfile.aboutMe || combinedProfile.bio || combinedProfile.description || "No description available. Click Edit Profile to add one."}
              </p>
            </CardContent>
          </Card>


          {/* Experiences */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Experiences</CardTitle>
              <Dialog open={isAddingExperience} onOpenChange={setIsAddingExperience}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Experience</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expTitle">Job Title</Label>
                        <Input
                          id="expTitle"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Product Designer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expCompany">Company</Label>
                        <Input
                          id="expCompany"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="e.g., Twitter"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expStart">Start Date</Label>
                        <Input
                          id="expStart"
                          type="month"
                          value={newExperience.startDate}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expEnd">End Date</Label>
                        <Input
                          id="expEnd"
                          type="month"
                          value={newExperience.endDate}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                          placeholder="Leave empty if current"
                        />
                      </div>
                    </div>
                      
                    <div>
                      <Label htmlFor="expDescription">Description</Label>
                      <Textarea
                        id="expDescription"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your role and achievements..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddExperience} disabled={addExperienceMutation.isPending}>
                      {addExperienceMutation.isPending ? "Adding..." : "Add Experience"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiences.length > 0 && experiences.map((exp: Experience) => (
                <div key={exp._id || exp.id} className="relative border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">
                            {exp.title || "Job Title"}
                          </h3>
                          <p className="text-sm font-medium text--600">
                            {exp.company || "Company Name"}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              disabled={removeExperienceMutation.isPending}
                            >
                              <X className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Experience</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this experience entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => {
                                  const id = exp._id || exp.id
                                  if (id) handleRemoveExperience(id)
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Experience
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <span>
                          {exp.startDate ? new Date(exp.startDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'} - {' '}
                          {exp.endDate ? new Date(exp.endDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                        </span>
                      </div>
                      
                      {exp.location && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {exp.location}
                        </p>
                      )}
                      
                      {exp.description && (
                        <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Add your work experience to showcase your professional journey
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Skills</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
                {skills.length === 0 && (
                  <span className="text-gray-500 text-sm">No skills added yet. Click Edit Profile to add skills.</span>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Portfolio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Portfolios</CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    height={200}
                    width={200}
                    src="/web-design-portfolio.png"
                    alt="Creativity - Web Design"
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    height={200}
                    width={200}
                    src="/mobile-app-design-concept.png"
                    alt="Grocery - Best Analytics"
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    height={200}
                    width={200}
                    src="/modern-data-dashboard.png"
                    alt="Blurry - Project Management App"
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image height={200} width={200} src="/abstract-branding-elements.png" alt="Brand Identity" className="object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Social Links */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Social Links</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
            
            {/* Linkedin */}
              {combinedProfile.linkedin ? (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <a 
                    href={combinedProfile.linkedin.startsWith('http') ? combinedProfile.linkedin : `https://linkedin.com/in/${combinedProfile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {combinedProfile.linkedin}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400 italic">Add LinkedIn profile</span>
                </div>
              )}
                {/* portfolio */}
              {typeof combinedProfile.portfolios === "string" && combinedProfile.portfolios ? (
                <div className="flex items-center gap-3">
                  <Badge className="h-4 w-4 bg-green-500 text-white">P</Badge>
                  <a 
                    href={typeof combinedProfile.portfolios === "string" && combinedProfile.portfolios.startsWith('http') ? combinedProfile.portfolios : `https://${combinedProfile.portfolios}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {combinedProfile.portfolios}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <Badge className="h-4 w-4 bg-gray-400 text-white">P</Badge>
                  <span className="text-sm text-gray-400 italic">Add portfolio link</span>
                </div>
              )}
              
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="aboutMe">About Me</Label>
              <Textarea
                id="aboutMe"
                value={editForm.aboutMe}
                onChange={(e) => setEditForm(prev => ({ ...prev, aboutMe: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentJob">Current Job</Label>
                <Input
                  id="currentJob"
                  value={editForm.currentJob}
                  onChange={(e) => setEditForm(prev => ({ ...prev, currentJob: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={editForm.education}
                  onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={editForm.instagram}
                  onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={editForm.instagram}
                  onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
