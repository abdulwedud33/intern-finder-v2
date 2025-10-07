"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/ui/image-upload"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Upload,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser } from "@/services/authService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CompanyProfile } from "@/types/auth"

interface SettingsFormData {
  // Account Settings
  name: string
  email: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  
  // Company Settings
  companyName: string
  description: string
  website: string
  industry: string
  companySize: string
  headquarters: string
  founded: string
  employees: string
  
  // Notification Settings
  emailNotifications: boolean
  applicationAlerts: boolean
  jobPostingAlerts: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  
  // Privacy Settings
  profileVisibility: 'public' | 'private'
  showContactInfo: boolean
  allowDirectMessages: boolean
  dataSharing: boolean
}

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 
  'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Other'
]

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees', 
  '201-500 employees', '501-1000 employees', '1000+ employees'
]

export default function ClientSettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("account")
  const [showPasswords, setShowPasswords] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch current user data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!user,
  })

  const [formData, setFormData] = useState<SettingsFormData>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    companyName: "",
    description: "",
    website: "",
    industry: "",
    companySize: "",
    headquarters: "",
    founded: "",
    employees: "",
    emailNotifications: true,
    applicationAlerts: true,
    jobPostingAlerts: false,
    marketingEmails: false,
    securityAlerts: true,
    profileVisibility: 'public',
    showContactInfo: true,
    allowDirectMessages: true,
    dataSharing: false
  })

  // Type guard to check if user is a company
  const isCompany = (user: any): user is CompanyProfile => {
    return user && user.role === 'company'
  }

  // Update form data when user data loads
  useEffect(() => {
    if (userData && isCompany(userData)) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        companyName: userData.name || "",
        description: userData.description || "",
        website: userData.website || "",
        industry: userData.industry || "",
        companySize: userData.companySize || "",
        headquarters: userData.headquarters || "",
        founded: userData.founded?.toString() || "",
        employees: userData.employees || ""
      }))
    }
  }, [userData])

  // Mock update mutations
  const updateAccountMutation = useMutation({
    mutationFn: async (data: Partial<SettingsFormData>) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast({ title: "Account settings updated successfully" })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: () => {
      toast({ title: "Failed to update account settings", variant: "destructive" })
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully" })
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
    },
    onError: () => {
      toast({ title: "Failed to update password", variant: "destructive" })
    }
  })

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<SettingsFormData>) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast({ title: "Company settings updated successfully" })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: () => {
      toast({ title: "Failed to update company settings", variant: "destructive" })
    }
  })

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: Partial<SettingsFormData>) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast({ title: "Notification settings updated successfully" })
    },
    onError: () => {
      toast({ title: "Failed to update notification settings", variant: "destructive" })
    }
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateAccountMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    if (formData.newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" })
      return
    }
    updatePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    })
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateCompanyMutation.mutate({
      companyName: formData.companyName,
      description: formData.description,
      website: formData.website,
      industry: formData.industry,
      companySize: formData.companySize,
      headquarters: formData.headquarters,
      founded: formData.founded,
      employees: formData.employees
    })
  }

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificationsMutation.mutate({
      emailNotifications: formData.emailNotifications,
      applicationAlerts: formData.applicationAlerts,
      jobPostingAlerts: formData.jobPostingAlerts,
      marketingEmails: formData.marketingEmails,
      securityAlerts: formData.securityAlerts
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({ title: "Logo uploaded successfully" })
    } catch (error) {
      toast({ title: "Failed to upload logo", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return <LoadingCard />
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load settings" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Settings className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and company preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Update your personal account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccountSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Company Logo</h3>
                      <p className="text-sm text-gray-500">
                        Upload your company logo. Recommended: 200x200px, JPG, PNG or GIF
                      </p>
                    </div>
                    <ImageUpload
                      type="logo"
                      currentImage={userData && isCompany(userData) ? userData.logo : undefined}
                      showPreview={true}
                      className="max-w-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateAccountMutation.isPending}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateAccountMutation.isPending ? "Saving..." : "Save Account Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Settings */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Update your company details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleInputChange("industry", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(industry => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleInputChange("companySize", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map(size => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="founded">Year Founded</Label>
                      <Input
                        id="founded"
                        type="number"
                        value={formData.founded}
                        onChange={(e) => handleInputChange("founded", e.target.value)}
                        placeholder="e.g. 2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="headquarters">Headquarters</Label>
                      <Input
                        id="headquarters"
                        value={formData.headquarters}
                        onChange={(e) => handleInputChange("headquarters", e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Tell us about your company..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateCompanyMutation.isPending}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateCompanyMutation.isPending ? "Saving..." : "Save Company Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="applicationAlerts">Application Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified when someone applies to your jobs</p>
                      </div>
                      <Switch
                        id="applicationAlerts"
                        checked={formData.applicationAlerts}
                        onCheckedChange={(checked) => handleInputChange("applicationAlerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="jobPostingAlerts">Job Posting Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified about job posting updates</p>
                      </div>
                      <Switch
                        id="jobPostingAlerts"
                        checked={formData.jobPostingAlerts}
                        onCheckedChange={(checked) => handleInputChange("jobPostingAlerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={formData.marketingEmails}
                        onCheckedChange={(checked) => handleInputChange("marketingEmails", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="securityAlerts">Security Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified about security-related activities</p>
                      </div>
                      <Switch
                        id="securityAlerts"
                        checked={formData.securityAlerts}
                        onCheckedChange={(checked) => handleInputChange("securityAlerts", checked)}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateNotificationsMutation.isPending}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {updateNotificationsMutation.isPending ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      <p className="text-sm text-gray-500">Control who can see your company profile</p>
                    </div>
                    <Select
                      value={formData.profileVisibility}
                      onValueChange={(value) => handleInputChange("profileVisibility", value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showContactInfo">Show Contact Information</Label>
                      <p className="text-sm text-gray-500">Display contact details on your profile</p>
                    </div>
                    <Switch
                      id="showContactInfo"
                      checked={formData.showContactInfo}
                      onCheckedChange={(checked) => handleInputChange("showContactInfo", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowDirectMessages">Allow Direct Messages</Label>
                      <p className="text-sm text-gray-500">Let others send you direct messages</p>
                    </div>
                    <Switch
                      id="allowDirectMessages"
                      checked={formData.allowDirectMessages}
                      onCheckedChange={(checked) => handleInputChange("allowDirectMessages", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataSharing">Data Sharing</Label>
                      <p className="text-sm text-gray-500">Allow data sharing for analytics and improvements</p>
                    </div>
                    <Switch
                      id="dataSharing"
                      checked={formData.dataSharing}
                      onCheckedChange={(checked) => handleInputChange("dataSharing", checked)}
                    />
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <CreditCard className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-500 mb-6">
                    You're currently on the free plan. Upgrade to access premium features.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full">
                      View Available Plans
                    </Button>
                    <Button variant="outline" className="w-full">
                      Payment Methods
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}