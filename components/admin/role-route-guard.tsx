"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface RoleRouteGuardProps {
  children: React.ReactNode
  allowedRoles: Array<"admin" | "merchant" | "customer_service" | "customer">
  redirectTo?: string
}

export function RoleRouteGuard({ children, allowedRoles, redirectTo }: RoleRouteGuardProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Get the appropriate redirect based on user role
  const getRedirectForRole = (role?: string) => {
    switch (role) {
      case "admin":
        return "/admin"
      case "merchant":
        return "/store-owner"
      case "customer_service":
        return "/customer-service"
      default:
        return "/"
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const currentPath = window.location.pathname
        router.push(`/auth?redirect=${currentPath}`)
      } else if (user && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard instead of generic redirect
        const properRedirect = redirectTo || getRedirectForRole(user.role)
        router.push(properRedirect)
      }
    }
  }, [user, isAuthenticated, loading, allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

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
