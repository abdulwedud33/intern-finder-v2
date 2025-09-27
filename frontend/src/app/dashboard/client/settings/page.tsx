"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Plus, Trash2, Loader2, Users, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompany } from "@/hooks/useCompany"
import { toast } from "sonner"

type FormData = {
  name: string
  description: string
  website: string
  industry: string
  companySize: string
  foundedYear: string
  foundedMonth: string
  headquarters: string
  contactEmail: string
  phoneNumber: string
  locations: string[]
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  youtube?: string
}

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Other'
]

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
]

export default function SettingsPage() {
  const { 
    profile, 
    team, 
    isLoading, 
    updateProfile, 
    inviteTeamMember, 
    updateMemberRole, 
    deleteTeamMember,
    uploadLogo 
  } = useCompany();

  const [activeTab, setActiveTab] = useState("profile")
  const [isUploading, setIsUploading] = useState(false)
  const [newLocation, setNewLocation] = useState("")
  const [notifications, setNotifications] = useState({
    applications: true,
    jobOpenings: false,
    recommendations: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    website: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    foundedMonth: '',
    headquarters: '',
    contactEmail: '',
    phoneNumber: '',
    locations: [],
    linkedin: '',
    twitter: '',
    facebook: ''
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || '',
        website: profile.website || '',
        industry: profile.industry || '',
        companySize: profile.companySize || '',
        foundedYear: profile.foundedYear?.toString() || '',
        foundedMonth: profile.foundedMonth || '',
        headquarters: profile.headquarters || '',
        contactEmail: profile.contactEmail || '',
        locations: profile.locations || [],
        phoneNumber: profile.phoneNumber || '',
        linkedin: profile.socialMedia?.linkedin || '',
        twitter: profile.socialMedia?.twitter || '',
        facebook: profile.socialMedia?.facebook || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      // Prepare the data to send to the API
      const profileData = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        industry: formData.industry,
        companySize: formData.companySize,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        foundedMonth: formData.foundedMonth || undefined,
        headquarters: formData.headquarters,
        contactEmail: formData.contactEmail,
        phoneNumber: formData.phoneNumber,
        locations: formData.locations?.filter(Boolean) || [],
        socialMedia: {
          ...(formData.linkedin && { linkedin: formData.linkedin }),
          ...(formData.twitter && { twitter: formData.twitter }),
          ...(formData.facebook && { facebook: formData.facebook }),
          ...(formData.instagram && { instagram: formData.instagram }),
          ...(formData.youtube && { youtube: formData.youtube })
        }
      };
      
      await updateProfile(profileData);
      toast.success('Company profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadLogo(file);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    try {
      await inviteTeamMember(email, role);
      form.reset();
      toast.success('Invitation sent successfully');
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Company Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {profile?.logo ? (
                        <AvatarImage src={profile.logo} alt={profile.name} />
                      ) : (
                        <AvatarFallback>
                          {profile?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">Company Logo</h3>
                    <p className="text-sm text-gray-500">
                      Recommended size: 200x200px, JPG, PNG or GIF
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      name="industry"
                      value={formData.industry}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, industry: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      name="companySize"
                      value={formData.companySize}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, companySize: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">Year Founded</Label>
                    <Input
                      id="foundedYear"
                      name="foundedYear"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      placeholder="e.g. 2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      name="headquarters"
                      value={formData.headquarters}
                      onChange={handleInputChange}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell us about your company"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactEmail: e.target.value
                        }))}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phoneNumber: e.target.value
                        }))}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headquarters">Headquarters</Label>
                      <Input
                        id="headquarters"
                        value={formData.headquarters}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          headquarters: e.target.value
                        }))}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">linkedin.com/company/</span>
                        <Input
                          id="linkedin"
                          value={formData.linkedin || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            linkedin: e.target.value
                          }))}
                          placeholder="your-company"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">twitter.com/</span>
                        <Input
                          id="twitter"
                          value={formData.twitter || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            twitter: e.target.value
                          }))}
                          placeholder="yourcompany"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">facebook.com/</span>
                        <Input
                          id="facebook"
                          value={formData.facebook || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            facebook: e.target.value
                          }))}
                          placeholder="yourpage"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">instagram.com/</span>
                        <Input
                          id="instagram"
                          value={formData.instagram || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            instagram: e.target.value
                          }))}
                          placeholder="yourprofile"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">youtube.com/</span>
                        <Input
                          id="youtube"
                          value={formData.youtube || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            youtube: e.target.value
                          }))}
                          placeholder="@yourchannel"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to your company account
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Open invite member dialog
                    const email = prompt('Enter email address:');
                    if (email) {
                      const role = prompt('Enter role (e.g., Admin, Member):', 'Member');
                      if (role) {
                        inviteTeamMember(email, role);
                      }
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <Users className="h-full w-full" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by inviting a new team member.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        const email = prompt('Enter email address:');
                        if (email) {
                          const role = prompt('Enter role (e.g., Admin, Member):', 'Member');
                          if (role) {
                            inviteTeamMember(email, role);
                          }
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Team Member
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {team.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            updateMemberRole(member.id, value)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this team member?')) {
                              deleteTeamMember(member.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <CreditCard className="h-full w-full" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No subscription</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by selecting a plan.
                </p>
                <div className="mt-6">
                  <Button>View Plans</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );



  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="max-w-2xl space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <p className="text-sm text-gray-600">This is company information that you can update anytime.</p>
                <hr />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div>
                  <h1 className="text-sm m-2 font-medium">Company Logo</h1>
                  <p className="text-xs text-gray-600 mb-3">This image will be shown publicly as your company logo.</p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/company-logo-slack.png" alt="Company Logo" />
                      <AvatarFallback>SL</AvatarFallback>
                    </Avatar>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex-1">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to replace or drag and drop</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 400 x 400px)</p>
                    </div>
                  </div>
                </div>
                <hr />

                {/* Company Details */}
                <h1>Company Detail</h1>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        website: e.target.value
                      }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Locations</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="Add a location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newLocation.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              locations: [...(prev.locations || []), newLocation.trim()]
                            }));
                            setNewLocation('');
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        if (newLocation.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            locations: [...(prev.locations || []), newLocation.trim()]
                          }));
                          setNewLocation('');
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>

                  {/* Badges List */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.locations?.map((location, index) => (
                      <Badge
                        key={`${location}-${index}`}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {location}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              locations: (prev.locations || []).filter((_, i) => i !== index)
                            }));
                          }}
                          className="ml-1 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Employee Count and Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select 
                      value={formData.companySize}
                      onValueChange={(value) => setFormData({...formData, companySize: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={formData.industry}
                      onValueChange={(value) => setFormData({...formData, industry: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Founded */}
                <div className="space-y-2">
                  <Label>Date Founded</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="foundedMonth">Month</Label>
                      <Select 
                        value={formData.foundedMonth}
                        onValueChange={(value) => setFormData({...formData, foundedMonth: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => {
                            const month = new Date(0, i).toLocaleString('en-US', {month: 'long'});
                            return (
                              <SelectItem key={i} value={month}>
                                {month}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="foundedYear">Year</Label>
                      <Input 
                        id="foundedYear"
                        type="number" 
                        min="1900" 
                        max={new Date().getFullYear()}
                        value={formData.foundedYear}
                        onChange={(e) => setFormData({...formData, foundedYear: e.target.value})}
                        placeholder="Year"
                      />
                    </div>
                  </div>
                </div>

                {/* Tech Stack - Removed as it's not part of the formData */}

                {/* About Company */}
                <div>
                  <Label htmlFor="description">About Company</Label>
                  <p className="text-xs text-gray-600 my-2">
                    Brief description for your company. URLs are hyperlinked.
                  </p>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm">
                        B
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        I
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        U
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        🔗
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">{formData.description.length} / 500</span>
                  </div>
                </div>

                <Button className="bg-teal-600 w-full hover:bg-teal-400">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Links</CardTitle>
                <p className="text-sm text-gray-600">
                  Add elsewhere links to your company profile. You can add only username without full https links.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      instagram: e.target.value
                    }))}
                    placeholder="https://www.instagram.com/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      twitter: e.target.value
                    }))}
                    placeholder="https://twitter.com/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      facebook: e.target.value
                    }))}
                    placeholder="https://www.facebook.com/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      linkedin: e.target.value
                    }))}
                    placeholder="https://www.linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.youtube || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      youtube: e.target.value
                    }))}
                    placeholder="https://www.youtube.com/@yourcompany"
                  />
                </div>
                <Button className="bg-teal-600 w-full hover:bg-teal-400">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Team</CardTitle>
                <p className="text-sm text-gray-600">{team.length} Member{team.length !== 1 ? 's' : ''}</p>
              </div>
              <Button 
                className="bg-teal-600 hover:bg-teal-400"
                onClick={async () => {
                  const email = prompt('Enter the email address of the team member to invite:');
                  if (email) {
                    try {
                      await inviteTeamMember(email, 'member');
                      toast.success('Invitation sent successfully');
                    } catch (error) {
                      toast.error('Failed to send invitation');
                    }
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                  <div key={member.id} className="text-center rounded-lg border p-4">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTeamMember(member.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Handle edit team member
                        }}
                      >
                        ✏️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="bg-teal-600 w-full hover:bg-teal-400 mt-6">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
