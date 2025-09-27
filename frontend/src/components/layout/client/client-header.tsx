"use client"

import { Button } from "@/components/ui/button"
import { Bell, Plus, ChevronDown, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export function ClientHeader() {
  return (
    <header className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-teal-800" />
          <span className="text-xl font-semibold">INTERN FINDER</span>
        </div>
        </Link>

        {/* Center Section (Bell + Post a Job) */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">10</span>
            </div>
          </div>

          {/* Post a Job Button */}
          <Link href="/dashboard/client/jobListings/new" passHref>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Post a job
          </Button>
          </Link>
          
        </div>

        {/* Company Dropdown - Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-gray-800 p-2 flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="" alt="Company Logo" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-100">Slack</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Link className="w-full" href="/dashboard/client/profile">
              Company Profile
              </Link>
              </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="w-full" href="/dashboard/client/settings">
              Settings
              </Link>
              </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="w-full" href="/logout">
              Logout
              </Link>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
