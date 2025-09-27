import type React from "react"
import { ClientHeader } from "@/components/layout/client/client-header"
import { ClientSidebar } from "@/components/layout/client/client-sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
