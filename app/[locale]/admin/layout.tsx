import type React from "react"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminRouteGuard>
  )
}
