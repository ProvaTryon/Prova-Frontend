"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard")
      return
    }

    // Redirect based on role
    switch (user?.role) {
      case "admin":
        router.push("/admin")
        break
      case "store_owner":
        router.push("/store-owner")
        break
      case "customer_service":
        router.push("/customer-service")
        break
      case "customer":
      default:
        router.push("/profile")
        break
    }
  }, [user, isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
