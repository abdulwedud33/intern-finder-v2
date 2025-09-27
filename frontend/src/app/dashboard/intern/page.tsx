import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MoreHorizontal, FileText, FileQuestionIcon, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function InternDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold m-2 text-gray-900">Dashboard</h1>
          <hr className="w-full" />
          <p className="text-gray-600 font-bold my-2">Good morning, Jake</p>
          <p className="text-sm text-gray-500">
            Here is what's happening with your job search applications from July 19 - July 25
          </p>
        </div>
        <div className="flex items-center space-x-2 border-2 p-2 rounded-md text-sm text-gray-600">
          <span>Jul 19 - Jul 25</span>
          <Calendar className="h-4 w-4" />
        </div>
      </div>

      {/* Stats and Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-extrabold mb-3 text-gray-600">Total Jobs Applied</p>
                  <p className="text-3xl font-bold text-gray-900">45</p>
                </div>
                <FileText className="h-20 w-15 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-extrabold mb-3 text-gray-600">Interviewed</p>
                  <p className="text-3xl font-bold text-gray-900">18</p>
                </div>
                <FileQuestionIcon className="h-20 w-15 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Applied Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs Applied Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-4 justify-center items-center">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="60, 100"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="40, 100"
                    strokeDashoffset="-60"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm mr-3 text-gray-600">Interviewed</span>
                </div>
                <span className="text-sm font-medium">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm mr-3 text-gray-600">Applied</span>
                </div>
                <span className="text-sm font-medium">40%</span>
              </div>
            </div>
            </div>
            <Link href="/dashboard/intern/applications">
            <Button variant="link" className="mt-16 text-blue-600">
              View All Applications →
            </Button>
            </Link>            
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center my-6">Upcomming Interviews</CardTitle>
            <hr />
            <div className="flex flex-row items-center justify-center gap-3 my-2">
            <p className="text-sm text-gray-600">Today, 26 November</p>
            <ChevronLeft className="w-5 h-5" />
            <ChevronRight className="w-5 h-5" />
            </div>
            <hr />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">10:00 AM</div>
            </div>
            <div className="flex items-center space-x-5">
              <div className="text-sm text-gray-500">10:30 AM</div>
              <div className="flex items-center space-x-2 bg-gray-200 rounded-md p-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src=""
                    alt="Avatar"
                    />
                  <AvatarFallback>JB</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Joe Bartmann</p>
                  <p className="text-xs text-gray-500">HR Manager at Drivy</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">11:00 AM</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Applications History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Application 1 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-purple-100">
                  <AvatarImage
                  src={""}
                  alt="Avatar" 
                   />
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Social Media Assistant</h3>
                  <p className="text-sm text-gray-600">Nomad • Paris, France • Full-time</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-sm text-gray-600">Date Applied</p>
                  <p className="text-sm font-medium">24 July 2021</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  In Review
                </Badge>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Application 2 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-blue-100">
                  <AvatarImage
                  src={""}
                  alt="Avatar" 
                   />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Social Media Assistant</h3>
                  <p className="text-sm text-gray-600">Udacity • New York, USA • Full-time</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-sm text-gray-600">Date Applied</p>
                  <p className="text-sm font-medium">23 July 2021</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Interviewed
                </Badge>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Application 3 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-red-100">
                  <AvatarImage
                  src={""}
                  alt="Avatar" 
                   />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Social Media Assistant</h3>
                  <p className="text-sm text-gray-600">Packer • Madrid, Spain • Full-time</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-sm text-gray-600">Date Applied</p>
                  <p className="text-sm font-medium">22 July 2021</p>
                </div>
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  Declined
                </Badge>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button variant="link" className="text-blue-600">
              View all applications history →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
