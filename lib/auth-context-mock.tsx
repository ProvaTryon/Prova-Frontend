"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  accountType: "customer" | "brand"
  role: "customer" | "admin" | "store_owner" | "customer_service"
  isGuest?: boolean
  storeId?: string // For store owners to identify their store
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, accountType: "customer" | "brand") => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isStoreOwner: boolean
  isCustomerService: boolean
  isCustomer: boolean
  continueAsGuest: () => void
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let mockUser: User

    if (email === "admin@prova.com" && password === "admin123") {
      mockUser = {
        id: "admin-1",
        name: "Admin User",
        email,
        accountType: "customer",
        role: "admin",
      }
    } else if (email === "store@prova.com" && password === "store123") {
      mockUser = {
        id: "store-1",
        name: "Store Owner",
        email,
        accountType: "brand",
        role: "store_owner",
        storeId: "store-001",
      }
    } else if (email === "cs@prova.com" && password === "cs123") {
      mockUser = {
        id: "cs-1",
        name: "Customer Service",
        email,
        accountType: "customer",
        role: "customer_service",
      }
    } else {
      mockUser = {
        id: "customer-1",
        name: "John Doe",
        email,
        accountType: "customer",
        role: "customer",
      }
    }

    setUser(mockUser)
  }

  const signup = async (name: string, email: string, password: string, accountType: "customer" | "brand") => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful signup
    setUser({
      id: Date.now().toString(),
      name,
      email,
      accountType,
      role: "customer",
    })
  }

  const signInWithGoogle = async () => {
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock successful Google sign-in
    setUser({
      id: `google-${Date.now()}`,
      name: "Google User",
      email: "user@gmail.com",
      accountType: "customer",
      role: "customer",
    })
  }

  const continueAsGuest = () => {
    setUser({
      id: `guest-${Date.now()}`,
      name: "Guest",
      email: "",
      accountType: "customer",
      isGuest: true,
      role: "customer",
    })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStoreOwner: user?.role === "store_owner",
        isCustomerService: user?.role === "customer_service",
        isCustomer: user?.role === "customer",
        continueAsGuest,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
