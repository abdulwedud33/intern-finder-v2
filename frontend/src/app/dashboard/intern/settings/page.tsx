"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Loader2, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Eye,
  EyeOff,
  Save,
  Download,
  Trash2,
  Settings as SettingsIcon,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Languages,
  Volume2,
  VolumeX
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

// Type definitions
type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  portfolio?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    bio?: string;
    profilePicture?: string;
  };
};

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profilePicture?: string;
  linkedin: string;
  github: string;
  twitter: string;
  portfolio: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationSettings = {
  emailNotifications: boolean;
  applicationUpdates: boolean;
  jobRecommendations: boolean;
  interviewReminders: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
};

type PrivacySettings = {
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
};

type AppearanceSettings = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
};

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  
  // Fetch current user data from auth endpoint
  const { data: userData, isLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      console.log('Making API call to /api/auth/me with token:', !!token)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      console.log('API response data:', data)
      return data
    },
    enabled: !!user,
    retry: false
  })
  
  // Debug logging
  console.log('Settings page - Auth user:', user)
  console.log('Settings page - User data:', userData)
  console.log('Settings page - Loading:', isLoading)
  console.log('Settings page - Error:', userError)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Form data states
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    linkedin: "",
    github: "",
    twitter: "",
    portfolio: ""
  })

  // Debug logging for form data
  console.log('Settings page - Form data:', formData)
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    applicationUpdates: true,
    jobRecommendations: true,
    interviewReminders: true,
    marketingEmails: false,
    pushNotifications: true,
    smsNotifications: false
  })
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    showOnlineStatus: true
  })
  
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    language: 'en',
    fontSize: 'medium',
    compactMode: false
  })
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Show loading state only for auth, not for profile API
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Show error state but still allow editing with basic user data
  if (userError && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">Failed to load your profile data: {userError.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // Load user data when userData changes
  useEffect(() => {
    if (userData?.data) {
      const currentUser = userData.data
      console.log('Current user data:', currentUser) // Debug log
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: currentUser.location || "",
        bio: currentUser.about || "", // Backend uses 'about' field
        linkedin: currentUser.social?.linkedin || "",
        github: currentUser.social?.github || "",
        twitter: "",
        portfolio: currentUser.social?.portfolio || currentUser.website || ""
      })
    } else if (user) {
      // Fallback to user data from auth context
      console.log('Using fallback user data:', user) // Debug log
      setFormData(prev => ({
        name: user.name || prev.name || "",
        email: user.email || prev.email || "",
        phone: user.phone || prev.phone || "",
        location: prev.location || "",
        bio: prev.bio || "",
        linkedin: prev.linkedin || "",
        github: prev.github || "",
        twitter: "",
        instagram: "",
        portfolio: prev.portfolio || ""
      }))
    }
  }, [userData, user])

  // Handle form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePrivacyToggle = (field: keyof PrivacySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleAppearanceChange = (field: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Save functions
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare data for API call
      const updateData = {
        name: formData.name,
        about: formData.bio, // Backend expects 'about' field
        location: formData.location,
        website: formData.portfolio,
        social: {
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio
        }
      }
      
      // Update using auth endpoint
      const response = await fetch('http://localhost:5000/api/auth/updatedetails', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        setSuccess("Profile updated successfully!")
        toast({
          title: "Success",
          description: "Your profile has been updated.",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      setError(errorMessage)
      toast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
        setSuccess("Password updated successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        toast({
          title: "Success",
          description: "Your password has been updated.",
        })
    } catch (err) {
      const errorMessage = "Failed to update password"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async (type: string) => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(`${type} settings saved successfully!`)
      toast({
        title: "Success",
        description: `Your ${type} settings have been updated.`,
      })
    } catch (err) {
      const errorMessage = `Failed to save ${type} settings`
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>
            <p className="text-gray-600">Manage your account settings and preferences</p>
            
          </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
      )}

      {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
        </TabsList>

          {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleSaveProfile}>
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Profile Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">Update your personal information and social links</p>
              </CardHeader>
                <CardContent className="p-6 space-y-6">
                {/* Profile Photo */}
                <div>
                    <Label className="text-sm font-medium text-gray-700">Profile Photo</Label>
                    <div className="mt-3 flex items-center gap-6">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={userData?.data?.avatar || "/placeholder-user.jpg"} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                          {formData.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Click to upload new photo</p>
                          <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 2MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />
                
                  {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={handleProfileChange}
                        className="mt-2" 
                      required 
                    />
                  </div>
                  <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleProfileChange}
                        className="mt-2" 
                      required 
                    />
                  </div>
                  <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                        onChange={handleProfileChange}
                        className="mt-2" 
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                      <Input 
                        id="location" 
                        value={formData.location} 
                        onChange={handleProfileChange}
                        className="mt-2" 
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={handleProfileChange}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Separator />

                  {/* Social Links */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                    {formData.linkedin || formData.github || formData.portfolio ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.linkedin && (
                          <div>
                            <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-blue-600" />
                              LinkedIn
                            </Label>
                            <Input 
                              id="linkedin" 
                              value={formData.linkedin} 
                              onChange={handleProfileChange}
                              className="mt-2" 
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>
                        )}
                        {formData.github && (
                          <div>
                            <Label htmlFor="github" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Github className="h-4 w-4 text-gray-800" />
                              GitHub
                            </Label>
                            <Input 
                              id="github" 
                              value={formData.github} 
                              onChange={handleProfileChange}
                              className="mt-2" 
                              placeholder="https://github.com/username"
                            />
                          </div>
                        )}
                        {formData.portfolio && (
                          <div className="md:col-span-2">
                            <Label htmlFor="portfolio" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Globe className="h-4 w-4 text-teal-600" />
                              Portfolio Website
                            </Label>
                            <Input 
                              id="portfolio" 
                              value={formData.portfolio} 
                              onChange={handleProfileChange}
                              className="mt-2" 
                              placeholder="https://yourportfolio.com"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No Social Links</p>
                        <p className="text-sm">No social links were provided during registration.</p>
                        <p className="text-sm">Contact support if you need to add social links to your profile.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Profile
                        </>
                      )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
          <form onSubmit={handleChangePassword}>
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Security Settings
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manage your password and account security</p>
              </CardHeader>
                <CardContent className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                    <div>
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                        Current Password
                      </Label>
                        <div className="relative mt-2">
                      <Input 
                        id="currentPassword" 
                            type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                            className="pr-10" 
                        required 
                      />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                        New Password
                      </Label>
                        <div className="relative mt-2">
                      <Input 
                        id="newPassword" 
                            type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                            className="pr-10" 
                        required 
                        minLength={8}
                      />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters with letters and numbers</p>
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm New Password
                      </Label>
                        <div className="relative mt-2">
                      <Input 
                        id="confirmPassword" 
                            type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                            className="pr-10" 
                        required
                        minLength={8}
                      />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">SMS Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Enable
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Notification Preferences
                </CardTitle>
                <p className="text-sm text-gray-600">Choose how you want to be notified about updates</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {Object.entries(notifications).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'emailNotifications' && 'Receive all email notifications'}
                              {key === 'applicationUpdates' && 'Get notified about application status changes'}
                              {key === 'jobRecommendations' && 'Receive job recommendations based on your profile'}
                              {key === 'interviewReminders' && 'Get reminders for upcoming interviews'}
                              {key === 'marketingEmails' && 'Receive promotional emails and updates'}
                            </p>
                      </div>
                      <Switch 
                            checked={value}
                            onCheckedChange={() => handleNotificationToggle(key as keyof NotificationSettings)}
                      />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Device Notifications</h3>
                    <div className="space-y-4">
                      {Object.entries(notifications).slice(5).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'pushNotifications' && 'Receive push notifications on your device'}
                              {key === 'smsNotifications' && 'Get SMS notifications for important updates'}
                        </p>
                      </div>
                      <Switch 
                            checked={value}
                            onCheckedChange={() => handleNotificationToggle(key as keyof NotificationSettings)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('notification')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-600" />
                  Privacy Settings
                </CardTitle>
                <p className="text-sm text-gray-600">Control who can see your information and contact you</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Profile Visibility</p>
                          <p className="text-sm text-gray-600">Control who can see your profile</p>
                        </div>
                        <select 
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' | 'connections' }))}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="public">Public</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      {Object.entries(privacy).slice(1).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'showEmail' && 'Display your email address on your profile'}
                              {key === 'showPhone' && 'Display your phone number on your profile'}
                              {key === 'showLocation' && 'Display your location on your profile'}
                              {key === 'allowMessages' && 'Allow others to send you messages'}
                              {key === 'showOnlineStatus' && 'Show when you are online'}
                            </p>
                          </div>
                          <Switch 
                            checked={typeof value === 'boolean' ? value : false}
                            onCheckedChange={() => handlePrivacyToggle(key as keyof PrivacySettings)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('privacy')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-indigo-600" />
                  Appearance Settings
                </CardTitle>
                <p className="text-sm text-gray-600">Customize the look and feel of your dashboard</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map(({ value, label, icon: Icon }) => (
                        <div
                          key={value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            appearance.theme === value 
                              ? 'border-teal-500 bg-teal-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleAppearanceChange('theme', value)}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm font-medium text-center">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Language</p>
                          <p className="text-sm text-gray-600">Choose your preferred language</p>
                        </div>
                        <select 
                          value={appearance.language}
                          onChange={(e) => handleAppearanceChange('language', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Display</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                          <p className="font-medium text-gray-900">Font Size</p>
                          <p className="text-sm text-gray-600">Adjust the text size for better readability</p>
                        </div>
                        <select 
                          value={appearance.fontSize}
                          onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Compact Mode</p>
                          <p className="text-sm text-gray-600">Use a more compact layout to fit more content</p>
                      </div>
                      <Switch 
                          checked={appearance.compactMode}
                          onCheckedChange={(checked) => handleAppearanceChange('compactMode', checked)}
                      />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('appearance')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}