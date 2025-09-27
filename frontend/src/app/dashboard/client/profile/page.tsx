"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUpdateClientProfile } from "@/hooks/useClientProfile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, MapPin, Users, Calendar, Settings, Plus, X } from "lucide-react"
import {
  useCompanyProfile,
  useUpdateCompanyProfile,
  useAddTeamMember,
  useRemoveTeamMember,
  usePublicCompanyProfile
} from "@/hooks/useProfile"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"
import { ErrorPage } from "@/components/ui/error-boundary"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import Link from "next/link"

import { CompanyProfile, TeamMember } from "@/types/company"
import { CompanyProfileFormData } from "@/types/forms"

interface ClientProfileProps {
  params?: { id?: string } // if id exists → public view
}

export default function ClientProfile({ params }: any) {
  const id = params?.id;
  const isPublic = Boolean(params?.id)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  // Define the form data type
  type OfficeLocation = {
    address: string
    city: string
    country: string
    isHeadquarters?: boolean
  }

  interface CompanyProfileFormData extends Omit<CompanyProfile, '_id' | 'createdAt' | 'updatedAt' | 'teamMembers' | 'socialMedia' | 'officeLocations'> {
    officeLocations: OfficeLocation[]
  }

  const [editForm, setEditForm] = useState<CompanyProfileFormData>({
    name: "",
    website: "",
    description: "",
    industry: "",
    phone: "",
    primaryContact: "",
    pressContact: "",
    generalContact: "",
    founded: 0,
    employees: "",
    techStack: [],
    officeLocations: []
  })
  const [techInput, setTechInput] = useState("")
  const [newMember, setNewMember] = useState({ name: "", role: "" })
  const [newOffice, setNewOffice] = useState({
    address: "",
    city: "",
    country: "",
    isHeadquarters: false
  })

  // Fetch data using React Query hooks
  const publicProfileQuery = usePublicCompanyProfile(params?.id || "")
  const privateProfileQuery = useCompanyProfile()
  
  // Use the appropriate query based on isPublic
  const { data: profileData, isLoading, error } = isPublic ? publicProfileQuery : privateProfileQuery

  // Update local profile state when profileData changes
  useEffect(() => {
    if (profileData) {
      // Type assertion to ensure profileData is treated as CompanyProfile
      const companyData = profileData as unknown as CompanyProfile;
      
      // Create a new company profile with default values
      const companyProfile: CompanyProfile = {
        _id: companyData._id || '',
        name: companyData.name || "",
        website: companyData.website || "",
        description: companyData.description || "",
        industry: companyData.industry || "",
        phone: companyData.phone || "",
        primaryContact: companyData.primaryContact || "",
        pressContact: companyData.pressContact || "",
        generalContact: companyData.generalContact || "",
        founded: companyData.founded || new Date().getFullYear(),
        employees: companyData.employees || "",
        techStack: Array.isArray(companyData.techStack) ? companyData.techStack : [],
        officeLocations: Array.isArray(companyData.officeLocations) 
          ? companyData.officeLocations.map(loc => ({
              address: loc.address || "",
              city: loc.city || "",
              country: loc.country || "",
              isHeadquarters: loc.isHeadquarters || false
            }))
          : [],
        teamMembers: Array.isArray(companyData.teamMembers) 
          ? companyData.teamMembers 
          : [],
        socialMedia: companyData.socialMedia || {},
        createdAt: companyData.createdAt || new Date().toISOString(),
        updatedAt: companyData.updatedAt || new Date().toISOString()
      };
      
      setProfile(companyProfile);
      
      // Update edit form with the properly typed data
      setEditForm({
        name: companyProfile.name,
        website: companyProfile.website || "",
        description: companyProfile.description || "",
        industry: companyProfile.industry || "",
        phone: companyProfile.phone || "",
        primaryContact: companyProfile.primaryContact || "",
        pressContact: companyProfile.pressContact || "",
        generalContact: companyProfile.generalContact || "",
        founded: companyProfile.founded || new Date().getFullYear(),
        employees: companyProfile.employees || "",
        techStack: companyProfile.techStack ? [...companyProfile.techStack] : [],
        officeLocations: companyProfile.officeLocations 
          ? companyProfile.officeLocations.map(loc => ({
              address: loc.address || "",
              city: loc.city || "",
              country: loc.country || "",
              isHeadquarters: loc.isHeadquarters || false
            }))
          : []
      });
    }
  }, [profileData])

  // Mutations (only for self dashboard)
  const updateProfileMutation = useUpdateClientProfile()

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(editForm)
      setIsEditing(false)
      // Optionally show a success message here
    } catch (error) {
      // Handle error (e.g., show error message to user)
      console.error('Error updating profile:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ...
  }

  const addMemberMutation = useAddTeamMember()
  const removeMemberMutation = useRemoveTeamMember()

  if (isLoading) return <LoadingPage />
  if (error) return <ErrorPage error={error as Error} />
  if (!profile) return <ErrorPage title="Profile not found" description="The company profile you're looking for doesn't exist." />

  const teamMembers = Array.isArray(profile?.teamMembers) ? profile.teamMembers : []
  const techStack = Array.isArray(profile?.techStack) ? profile.techStack : []
  const officeLocations = Array.isArray(profile?.officeLocations) ? profile.officeLocations : []

  const handleRemoveTech = (techToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      techStack: prev.techStack?.filter(tech => tech !== techToRemove) || []
    }))
  }

  const handleAddTech = () => {
    if (techInput.trim() && !editForm.techStack?.includes(techInput)) {
      setEditForm(prev => ({
        ...prev,
        techStack: [...(prev.techStack || []), techInput]
      }))
      setTechInput("")
    }
  }

  const handleStartEditing = () => {
    if (!profile) return
    
    setEditForm({
      name: profile.name,
      website: profile.website || "",
      description: profile.description || "",
      industry: profile.industry || "",
      phone: profile.phone || "",
      primaryContact: profile.primaryContact || "",
      pressContact: profile.pressContact || "",
      generalContact: profile.generalContact || "",
      founded: profile.founded || 0,
      employees: profile.employees || "",
      techStack: [...(profile.techStack || [])],
      officeLocations: (profile.officeLocations || []) as OfficeLocation[]
    })
    setIsEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.name.trim()) {
      toast.error("Company name is required")
      return
    }

    // Prepare the form data with proper types
    const formDataToSubmit = {
      ...editForm,
      founded: editForm.founded ? String(editForm.founded) : undefined,
    }

    try {
      await updateProfileMutation.mutateAsync(formDataToSubmit as any)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const handleAddMember = () => {
    if (newMember.name && newMember.role) {
      addMemberMutation.mutate(newMember, {
        onSuccess: () => {
          setIsAddingMember(false)
          setNewMember({ name: "", role: "" })
        }
      })
    }
  }

  const handleRemoveMember = (memberId: string) => {
    removeMemberMutation.mutate(memberId)
  }


  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.logo} alt={profile.name} />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {profile.name?.slice(0, 2) || "CO"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline text-sm"
              >
                <Globe className="h-4 w-4 inline mr-1" />
                {profile.website}
              </a>
            )}

            <div className="mt-3 flex flex-wrap gap-6 text-sm text-gray-600">
              {profile.founded && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Founded {profile.founded}</span>
                </div>
              )}
              {profile.employees && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{profile.employees} employees</span>
                </div>
              )}
              {officeLocations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{officeLocations.length} locations</span>
                </div>
              )}
              {profile.industry && (
                <div className="flex items-center space-x-2">
                  <span>🏢</span>
                  <span>{profile.industry}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isPublic && (
          <div className="flex items-center space-x-3">
            <Button onClick={handleStartEditing} className="px-4 py-2 rounded-lg border bg-white border-teal-600 text-teal-600">
              Profile Settings
            </Button>
          </div>
        )}
      </div>

      {/* About, Team, Tech, Office */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* About Company */}
        {profile.description && (
          <Card>
            <CardHeader>
              <CardTitle>About {profile.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{profile.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Team Section */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Team ({teamMembers.length})</CardTitle>
            {!isPublic && (
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="memberName">Name</Label>
                      <Input
                        id="memberName"
                        value={newMember.name}
                        onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="memberRole">Role</Label>
                      <Input
                        id="memberRole"
                        value={newMember.role}
                        onChange={(e) => setNewMember((prev) => ({ ...prev, role: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamMembers.map((member: any) => (
              <Card key={member._id || member.id} className="text-center relative">
                { !isPublic && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100"
                        disabled={removeMemberMutation.isPending}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.name} from the team? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member._id || member.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove Member
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <CardContent className="p-4">
                  <Avatar className="w-16 h-16 bg-blue-500 mx-auto mb-3">
                    <AvatarFallback className="text-white font-bold">{member.name?.slice(0, 2) || "TM"}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-gray-900">{member.name || "Team Member"}</h3>
                  <p className="text-sm text-gray-600">{member.role || "Role"}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {techStack.map((tech, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{tech.slice(0, 2)}</span>
                </div>
                <p className="text-xs text-gray-600">{tech}</p>
              </div>
            ))}
            {techStack.length === 0 && <p className="col-span-3 text-center text-gray-500 py-4">No tech stack added</p>}
          </CardContent>
        </Card>

        {/* Office Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Office Locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {officeLocations.map((loc, i) => (
              <div key={i} className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {loc.address}, {loc.city}, {loc.country}
                  {loc.isHeadquarters && ' (HQ)'}
                </span>
              </div>
            ))}
            {officeLocations.length === 0 && <p className="text-center text-gray-500 py-4">No office locations added</p>}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog for self */}
      {!isPublic && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editForm.website}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founded">Founded</Label>
                  <Input
                    id="founded"
                    value={editForm.founded}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, founded: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    value={editForm.employees}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, employees: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={editForm.industry}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input
                    id="primaryContact"
                    value={editForm.primaryContact}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, primaryContact: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
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
      )}
    </div>
  )
}
