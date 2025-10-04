"use client"

import { Button } from "@/components/ui/button"
import { Bell, Plus, ChevronDown, User, LogOut, Settings, Briefcase, UserCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export function ClientHeader() {
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-teal-800" />
          <span className="text-md font-semibold">INTERN FINDER</span>
        </div>
        </Link>

        {/* Center Section (Bell + Post a Job) */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 relative">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">10</span>
              </div>
            </Button>
          </div>

          {/* Post a Job Button */}
          <Link href="/dashboard/client/jobListings/new" passHref>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Post a job
          </Button>
          </Link>
          
        </div>

        {/* Company Avatar Dropdown - Right */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-gray-800 p-2 flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.role === 'company' ? (user as any).logo : undefined} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="bg-teal-500 text-white text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-100">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/client" className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/client/profile" className="flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Company Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/client/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="flex items-center text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
