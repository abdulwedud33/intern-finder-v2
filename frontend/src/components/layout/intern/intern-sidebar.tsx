'use client'

import { LayoutDashboard, MessageSquare, FileText, Building2, User, Settings, HelpCircle, ChevronRight, X, Star, Calendar, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"


export function InternSidebar() {
const pathname = usePathname();
const { logout, user } = useAuth();
const [isOpen, setIsOpen] = useState(false);

const links = [
    { href: "/dashboard/intern", label: "Dashboard", icon: LayoutDashboard},
    { href: "/dashboard/intern/messages", label: "Messages", icon: MessageSquare, startWith: "/dashboard/intern/messages"},
    { href: "/dashboard/intern/applications", label: "My Applications", icon: FileText, startWith: "/dashboard/intern/applications"},
    { href: "/dashboard/intern/reviews", label: "Reviews & Feedback", icon: Star, startWith: "/dashboard/intern/reviews"},
    { href: "/dashboard/intern/interviews", label: "Interviews", icon: Calendar, startWith: "/dashboard/intern/interviews"},
    { href: "/dashboard/intern/work-history", label: "Work History", icon: Briefcase, startWith: "/dashboard/intern/work-history"},
    { href: "/dashboard/intern/company", label: "Company", icon: Building2, startWith: "/dashboard/intern/company"},
    { href: "/dashboard/intern/profile", label: "Profile", icon: User, startWith: "/dashboard/intern/profile"},
  ];

const link2= [
    { href: "/dashboard/intern/settings", label: "Settings", icon: Settings },
    { href: "", label: "Support", icon: HelpCircle },
  ];  

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-10 left-4 z-50 md:hidden bg-teal-500 text-white p-3 rounded-lg shadow-lg hover:bg-teal-600 transition-colors border-2 border-white"
        aria-label="Open Sidebar"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-[#EBF5F4] border-r border-gray-200 min-h-screen fixed md:relative z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
        {/* Main Navigation */}
        <nav className="space-y-3">
      {links.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.startWith && pathname.startsWith(item.startWith))

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              isActive
                ? "bg-blue-50 text-teal-800 border-r-2 border-l-2 border-teal-700"
                : "text-gray-700 hover:bg-teal-100 hover:text-teal-500"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>

        {/* Settings Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">SETTINGS</h3>
          <nav className="space-y-2">
      {link2.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              isActive
                ? "bg-blue-50 text-teal-800 border-r-2 border-l-2 border-teal-700"
                : "text-gray-700 hover:bg-teal-100 hover:text-teal-500"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
          </nav>
        </div>

        {/* intern Avatar, Name and email */}
       {/* if user is in the dashboard/intern/profile show logout*/}
       <div className="mt-18">
           {pathname === "/dashboard/intern/profile" && (
        <button onClick={async () => { try { await logout(); } catch(_) {} }} className="my-4 p-2 flex items-center space-x-2 bg-white hover:bg-gray-50 rounded-lg transition-colors">
          {/*logout icon*/}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">Logout</p>
          </div>
        </button>
        )}
        <Link 
          href="/dashboard/intern/profile" 
          className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded-lg transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-teal-500 text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'IF'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Intern Name'}</p>
            <p className="text-xs text-gray-500">
              {user?.email || 'internemail@gmail.com'}
            </p>
          </div>
        </Link>
       </div>
       
      </div>
    </aside>
    </>
  )
}
