import type React from "react"
import { RoleRouteGuard } from "@/components/admin/role-route-guard"
import { StoreSidebar } from "@/components/store-owner/store-sidebar"

export default function StoreOwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleRouteGuard allowedRoles={["store_owner"]}>
      <div className="flex">
        <StoreSidebar />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </RoleRouteGuard>
  )
}
