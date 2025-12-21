import type React from "react"
import { RoleRouteGuard } from "@/components/admin/role-route-guard"
import { CSSidebar } from "@/components/customer-service/cs-sidebar"

export default function CustomerServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleRouteGuard allowedRoles={["customer_service"]}>
      <div className="flex">
        <CSSidebar />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </RoleRouteGuard>
  )
}
