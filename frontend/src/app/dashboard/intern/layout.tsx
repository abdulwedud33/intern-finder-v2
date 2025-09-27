import type React from "react"
import { InternHeader } from "@/components/layout/intern/intern-header"
import { InternSidebar } from "@/components/layout/intern/intern-sidebar"

export default function InternLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternHeader />
      <div className="flex">
        <InternSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
