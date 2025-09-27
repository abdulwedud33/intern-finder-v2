"use client"

import { Bell, User, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function InternHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <User className="w-6 h-6 text-teal-800" />
          <span className="text-xl font-semibold">Intern Finder</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white hover:text-green-400 transition-colors">
            Home
          </Link>
          <Link
            href="/dashboard/intern"
            className={cn(
              "hover:text-green-400 transition-colors",
              pathname.startsWith("/dashboard/intern") ? "font-bold text-teal-600" : "text-white"
            )}
          >
            Dashboard
          </Link>
          <Link href="/jobs" className="text-white hover:text-green-400 transition-colors">
            Jobs
          </Link>
          <Link href="/about" className="text-white hover:text-green-400 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-white hover:text-green-400 transition-colors">
            Contact
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
         <Link href="/dashboard/intern/profile">
         <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
            <User className="h-5 w-5" />
          </Button>
         </Link>
          
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

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
          <nav className="flex flex-col gap-3 space-y-2">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-white hover:text-green-400">
              Home
            </Link>
            <Link href="/dashboard/intern" onClick={() => setIsOpen(false)} className="text-white hover:text-green-400">
              Dashboard
            </Link>
            <Link href="/jobs" onClick={() => setIsOpen(false)} className="text-white hover:text-green-400">
              Jobs
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-white hover:text-green-400">
              About Us
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-white hover:text-green-400">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
