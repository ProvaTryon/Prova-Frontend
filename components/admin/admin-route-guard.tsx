"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin")
      } else if (!isAdmin) {
        // Redirect non-admin users to their appropriate dashboard
        switch (user?.role) {
          case "merchant":
            router.push("/store-owner")
            break
          case "customer_service":
            router.push("/customer-service")
            break
          default:
            router.push("/")
        }
      }
    }
  }, [isAdmin, isAuthenticated, loading, user?.role, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
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
