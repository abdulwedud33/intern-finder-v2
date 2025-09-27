'use client'

import { LayoutDashboard, MessageSquare, FileText, Building2, User, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import Link from "next/link"


export function ClientSidebar() {
const pathname = usePathname();

const links = [
    { href: "/dashboard/client", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/client/profile", label: "Company Profile", icon: User, startWith: "/dashboard/client/profile"},
    { href: "/dashboard/client/messages", label: "Messages", icon: MessageSquare, startWith: "/dashboard/client/messages"},
    { href: "/dashboard/client/applicants", label: "All Applicants", icon: FileText, startWith: "/dashboard/client/applicants"},
    { href: "/dashboard/client/jobListings", label: "Job Listings", icon: Building2, startWith: "/dashboard/client/jobListings"},
  ];

const link2= [
    { href: "/dashboard/client/settings", label: "Settings", icon: Settings },
    { href: "", label: "Support", icon: HelpCircle },
  ];  

  return (
    <aside className="w-64 bg-[#EBF5F4] border-r border-gray-200 min-h-screen">
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
           {pathname === "/dashboard/client/profile" && (
        <Link href="/logout" className="my-4 p-2 flex items-center space-x-2 bg-white hover:bg-red-800 rounded-lg transition-colors">
          {/*logout icon*/}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">Logout</p>
          </div>
        </Link>
        )}
        <Link href="/dashboard/intern/profile" className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded-lg transition-colors">
          <Avatar className="w-12 h-12">
            <AvatarFallback>IF</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">intern name</p>
            <p className="text-xs text-gray-500">
              internemail@gmail.com
            </p>
          </div>
        </Link>
       </div>
       
      </div>
    </aside>
  )
}
