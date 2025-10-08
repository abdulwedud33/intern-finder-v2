"use client"

import { Bell, User, Menu, ChevronRight, LogOut, Settings, Briefcase, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getUserAvatarUrl } from "@/utils/imageUtils"

export function InternHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <User className="w-6 h-6 text-teal-700" />
          <span className="text-md font-semibold">INTERN FINDER</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white hover:text-teal-400 transition-colors">
            Home
          </Link>
          <Link
            href="/dashboard/intern"
            className={cn(
              "hover:text-teal-400 transition-colors",
              pathname.startsWith("/dashboard/intern") ? "font-bold text-teal-600" : "text-white"
            )}
          >
            Dashboard
          </Link>
          <Link href="/jobs" className="text-white hover:text-teal-400 transition-colors">
            Jobs
          </Link>
          <Link href="/about" className="text-white hover:text-teal-400 transition-colors">
            About
          </Link>
        </nav>

        {/* Right Side Icons */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Notification Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="border-b px-4 py-2 flex justify-between items-center">
                <span className="font-semibold">Notifications</span>
                <button className="text-sm text-blue-600 hover:underline">
                  Mark all as read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y">
                {/* Notification 1 */}
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm">
                    <span className="font-medium">Jan Meyer</span> invited you to interview
                  </p>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>

                {/* Notification 2 */}
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm">
                    <span className="font-medium">Jana Alicia</span> updated your job application status
                  </p>
                  <span className="text-xs text-green-600 font-medium">Shortlisted</span>
                </div>

                {/* Notification 3 - Interview Details */}
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm">
                    <span className="font-medium">Ally Work</span> sent you an interview invitation
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    <p className="font-semibold">Interview – Social Media Manager</p>
                    <p>Tue, 20 Jul 2021 | 12:00 – 12:30 PM</p>
                    <p className="text-blue-600">with Jake Gyll – jake@smmedia.com</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Avatar Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={getUserAvatarUrl(user)} 
                      alt={user.name} 
                    />
                    <AvatarFallback className="bg-teal-500 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
                  <Link href="/dashboard/intern" className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/intern/profile" className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/intern/settings" className="flex items-center">
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
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        {user ? (
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(true)}
            aria-label="Open Menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.avatar} 
                alt={user.name} 
              />
              <AvatarFallback className="bg-teal-500 text-white text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 z-50 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-700">
          <span className="text-lg font-semibold text-white">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-green-400"
            aria-label="Close Menu"
          >
            <div className="rounded-full bg-gray-700 p-1">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* User Info Section */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                <Avatar className="h-10 w-10 ring-2 ring-teal-500/20">
                  <AvatarImage 
                    src={user.avatar} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="bg-teal-500 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-300 truncate">{user.email}</p>
                  <p className="text-xs text-teal-400 capitalize">{user.role}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link
                  href="/dashboard/intern"
                  className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-teal-400 hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Briefcase className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/intern/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-teal-400 hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircle className="w-4 h-4 mr-3" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/intern/settings"
                  className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-teal-400 hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex ml-6 flex-col gap-3 space-y-2">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400">
              Home
            </Link>
            <Link href="/dashboard/intern" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400">
              Dashboard
            </Link>
            <Link href="/jobs" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400">
              Jobs
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400">
              About
            </Link>
           
          </nav>
        </div>
      </div>
    </header>
  )
}
