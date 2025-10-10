"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { User, Menu, ChevronRight, LogOut, Settings, Briefcase, UserCircle, Bell } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getUserAvatarUrl } from "@/utils/imageUtils"

type user = {
  id: string
  name: string
  email: string
  role: "intern" | "company"
  avatar?: string
  logo?: string
}

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<user | null>(null)
  const { user: authUser, logout } = useAuth()

  // Sync the local user state with the auth context
  useEffect(() => {
    setUser(authUser)
  }, [authUser])

  const dashboardPath =
    user?.role === "company" ? "/dashboard/client" : "/dashboard/intern"


  const hideRoutes = ["/login", "/register"]

  const isJobsPage = pathname === "/jobs" || pathname.startsWith("/jobs/")

const isDashboardPage =
  pathname.startsWith("/dashboard/client") ||
  pathname.startsWith("/dashboard/intern")

if (hideRoutes.includes(pathname) || isDashboardPage) {
  return null // Don't render the header
}


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <User className="w-5 h-5 text-teal-800" />
            <span className="font-bold text-md text-white">INTERN FINDER</span>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-8">
               <Link href={"/"} className={cn(
                "text-sm font-medium transition-colors hover:text-teal-400",
                pathname === "/" ? "text-teal-400" : "text-gray-300"
              )}>
              <li>
                Home                
              </li>
               </Link>

               { user && (
               <Link href={dashboardPath} className={cn(
                "text-sm font-medium transition-colors hover:text-teal-400",
                pathname === dashboardPath ? "text-teal-400" : "text-gray-300"
              )}>
                <li>
                  Dashboard
                </li>
              </Link>
               )}
      
              <Link href={"/jobs"} className={cn(
                "text-sm font-medium transition-colors hover:text-teal-400",
                isJobsPage ? "text-teal-400" : "text-gray-300"
              )}>
                <li>
                  Jobs
                </li>
              </Link>
              <Link href={"/about"} className={cn(
                "text-sm font-medium transition-colors hover:text-teal-400",
                pathname === "/about" ? "text-teal-400" : "text-gray-300"
              )}>
                <li>
                  About
                </li>
              </Link>
            </ul>
          </nav>


          {/* Auth Buttons (Desktop) */}
          {user ? (
              <div className="hidden md:flex items-center space-x-4">
              {/* Notifications for companies */}
              {user.role === 'company' && (
                <Button variant="ghost" size="sm" className="relative text-white hover:text-teal-400 hover:bg-gray-800">
                  <Bell className="h-5 w-5" />
                  {/* You can add a notification badge here if needed */}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="relative h-10 w-10 rounded-full p-0">
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
                    <Link href={dashboardPath} className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${dashboardPath}/profile`} className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${dashboardPath}/settings`} className="flex items-center">
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
              </div>
          ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:text-teal-400 hover:bg-gray-800"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
          )}

          {/* Mobile Menu Toggle */}
          {user ? (
            <button
              className="md:hidden text-white"
              onClick={() => setIsOpen(true)}
              aria-label="Open Menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={getUserAvatarUrl(user)} 
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
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
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
            className="text-white hover:text-teal-400"
            aria-label="Close Menu"
          >
            <div className="rounded-full bg-gray-700 p-1">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">

          { /* Mobile Navigation Links */} 
           
           <nav className="flex flex-col justify-center items-center gap-3 space-y-2">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium hover:text-teal-400",
                pathname === "/" ? "text-teal-400" : "text-gray-300"
              )}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {user && (
            <Link
              href={dashboardPath}
              className={cn(
                "text-sm font-medium hover:text-teal-400",
                pathname === dashboardPath ? "text-teal-400" : "text-gray-300"
              )}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            )}
            <Link
              href="/jobs"
              className={cn(
                "text-sm font-medium hover:text-teal-400",
                pathname === "/jobs" ? "text-teal-400" : "text-gray-300"
              )}
              onClick={() => setIsOpen(false)}
            >
              Jobs
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium hover:text-teal-400",
                pathname === "/about" ? "text-teal-400" : "text-gray-300"
              )}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
           </nav>
           
           {user ? (
            <div className="space-y-2">
              {/* Mobile Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full p-7 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">
                    <div className="flex items-center space-x-3 w-full">
                      <Avatar className="h-10 w-10 ring-2 ring-teal-500/20">
                        <AvatarImage 
                          src={getUserAvatarUrl(user)} 
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
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
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
                  {user.role === 'company' && (
                    <DropdownMenuItem className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={dashboardPath} className="flex items-center" onClick={() => setIsOpen(false)}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${dashboardPath}/profile`} className="flex items-center" onClick={() => setIsOpen(false)}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${dashboardPath}/settings`} className="flex items-center" onClick={() => setIsOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="flex items-center text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
           ) : (
          <div className="pt-6 space-y-2">
            <Button
              variant="ghost"
              className="text-white hover:text-teal-400 hover:bg-gray-700 w-full"
              asChild
            >
              <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white w-full"
              asChild
            >
              <Link href="/register" onClick={() => setIsOpen(false)}>Register</Link>
            </Button>
          </div>
          )}
        </div>
      </div>
    </header>
  )
}
