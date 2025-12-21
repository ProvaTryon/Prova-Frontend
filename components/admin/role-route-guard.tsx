"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleRouteGuardProps {
  children: React.ReactNode
  allowedRoles: Array<"admin" | "store_owner" | "customer_service" | "customer">
  redirectTo?: string
}

export function RoleRouteGuard({ children, allowedRoles, redirectTo = "/" }: RoleRouteGuardProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${currentPath}`)
    } else if (user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo)
    }
  }, [user, isAuthenticated, allowedRoles, redirectTo, router])

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
