"use client"

import { useState, useEffect } from "react"
import { toast, useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { getAuthUser, updateUserDetails, updateUserPassword } from "@/lib/api"
import type { ApiResponse } from "@/types/api"

// Type definitions
type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationSettings = {
  applications: boolean;
  jobOpenings: boolean;
  recommendations: boolean;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: ""
  })
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [notifications, setNotifications] = useState<NotificationSettings>({
    applications: true,
    jobOpenings: true,
    recommendations: true
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const response = await getAuthUser();
        
        if (response.ok && response.data) {
          const userData = response.data as UserData;
          
          setProfileData({
            name: userData.name || userData.user?.name || "",
            email: userData.email || userData.user?.email || "",
            phone: userData.phone || userData.user?.phone || ""
          });
        } else {
          // Type-safe error handling for the API response
          const errorMessage = 'error' in response ? response.error : "Failed to fetch user data";
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load user data"
        setError(errorMessage)
        console.error("Error loading user data:", err)
        
        // Show toast notification for the error
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [toast])

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle notification toggle
  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Only include name and email as per the API type definition
      const response = await updateUserDetails({
        name: profileData.name,
        email: profileData.email
      });

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        toast({
          title: "Success",
          description: "Your profile has been updated.",
          variant: "default"
        });
      } else {
        // Type-safe error handling for the API response
        const errorMessage = 'error' in response ? response.error : "Failed to update profile";
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
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

  // Change password
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSaving(true)

    try {
      const response = await updateUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.ok) {
        setSuccess("Password updated successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        toast({
          title: "Success",
          description: "Your password has been updated.",
          variant: "default"
        })
      } else {
        throw new Error(response.error || "Failed to update password")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
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

  // Save notification preferences
  const handleSaveNotifications = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess("Notification preferences saved!")
      toast({
        title: "Success",
        description: "Your notification preferences have been updated.",
        variant: "default"
      })
    } catch (err) {
      const errorMessage = "Failed to save notification preferences"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      <hr />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="login">Login Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* My Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleSaveProfile}>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <p className="text-sm text-gray-600">This is your personal information that you can update anytime.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <Label className="text-sm font-medium">Profile Photo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/professional-headshot.png" alt="Profile" />
                      <AvatarFallback>
                        {profileData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to replace or drag and drop</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 400x400px)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileData.name} 
                      onChange={handleProfileChange}
                      className="mt-1" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email} 
                      onChange={handleProfileChange}
                      className="mt-1" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profileData.phone} 
                      onChange={handleProfileChange}
                      className="mt-1" 
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.location.reload()}
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
                    ) : 'Save Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Login Details Tab */}
        <TabsContent value="login" className="space-y-6">
          <form onSubmit={handleChangePassword}>
            <Card>
              <CardHeader>
                <CardTitle>Login & Security</CardTitle>
                <p className="text-sm text-gray-600">Update your password and secure your account.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div>
                  <Label className="text-sm font-medium">Change Password</Label>
                  <p className="text-xs text-gray-500 mt-1">Manage your password to keep your account secure</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm">
                        Current Password
                      </Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="mt-1" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-sm">
                        New Password
                      </Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="mt-1" 
                        required 
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm">
                        Confirm New Password
                      </Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="mt-1" 
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">Re-enter your new password</p>
                    </div>
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
                      ) : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <form onSubmit={handleSaveNotifications}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-gray-600">Customize how you receive notifications from our platform.</p>
              </CardHeader>
              <hr />
              <CardContent className="space-y-6">
                {/* Notifications */}
                <div>
                  <Label className="text-sm font-bold">Email Notifications</Label>
                  <p className="text-xs text-gray-500 my-2">Customize your notification preferences</p>
                  <hr />
                  <div className="mt-4 space-y-4 ml-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Application Updates</p>
                        <p className="text-xs text-gray-500">Get notified about the status of your job applications</p>
                      </div>
                      <Switch 
                        checked={notifications.applications}
                        onCheckedChange={() => handleNotificationToggle('applications')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Job Recommendations</p>
                        <p className="text-xs text-gray-500">
                          Receive notifications about job openings that match your profile
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.jobOpenings}
                        onCheckedChange={() => handleNotificationToggle('jobOpenings')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Personalized Content</p>
                        <p className="text-xs text-gray-500">Get updates and recommendations based on your activity</p>
                      </div>
                      <Switch 
                        checked={notifications.recommendations}
                        onCheckedChange={() => handleNotificationToggle('recommendations')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.location.reload()}
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
                    ) : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
