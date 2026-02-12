"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as authService from "./auth-service"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  accountType: "customer" | "brand"
  role: "customer" | "admin" | "merchant" | "customer_service"
  isGuest?: boolean
  storeId?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  signup: (name: string, email: string, password: string, role: "user" | "merchant", additionalData?: {
    companyName?: string;
    companyId?: string;
    nationalId?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    confirmPassword?: string;
  }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isStoreOwner: boolean
  isCustomerService: boolean
  isCustomer: boolean
  continueAsGuest: () => void
  signInWithGoogle: () => Promise<void>
  updateUserProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ==========================================
  // 🔄 تحميل المستخدم عند بدء التطبيق
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken()
        if (token) {
          // جلب بيانات المستخدم من localStorage (تم حفظها عند تسجيل الدخول/التسجيل)
          const userData = authService.getStoredUser()
          if (userData) {
            setUser({
              id: userData.id || userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.address,
              role: userData.role,
              accountType: userData.role === 'merchant' ? 'brand' : 'customer',
              storeId: userData.storeId,
            })
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        // إذا فشل التحميل، امسح البيانات القديمة
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // ==========================================
  // 🔐 تسجيل الدخول
  // ==========================================
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true)
      const response = await authService.login({ email, password })

      const userData: User = {
        id: response.user.id || response.user._id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        address: response.user.address,
        role: response.user.role,
        accountType: response.user.role === 'merchant' ? 'brand' : 'customer',
        storeId: response.user.storeId,
      }

      setUser(userData)
      return userData
    } catch (error: any) {
      throw new Error(error.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 📝 التسجيل (إنشاء حساب جديد)
  // ==========================================
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "user" | "merchant",
    additionalData?: {
      companyName?: string;
      companyId?: string;
      nationalId?: string;
      phone?: string;
      address?: string;
      birth_date?: string;
      confirmPassword?: string;
    }
  ) => {
    try {
      setLoading(true)

      const response = await authService.register({
        name,
        email,
        password,
        role,
        phone: additionalData?.phone,
        address: additionalData?.address,
        birth_date: additionalData?.birth_date,
        confirmPassword: additionalData?.confirmPassword,
        companyName: additionalData?.companyName,
        companyId: additionalData?.companyId,
        nationalId: additionalData?.nationalId,
      })

      setUser({
        id: response.user.id || response.user._id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        address: response.user.address,
        role: response.user.role,
        accountType: role === 'merchant' ? 'brand' : 'customer',
        storeId: response.user.storeId,
      })
    } catch (error: any) {
      throw new Error(error.message || 'فشل التسجيل')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 🚪 تسجيل الخروج
  // ==========================================
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // ==========================================
  // 👤 متابعة كضيف
  // ==========================================
  const continueAsGuest = () => {
    const guestUser: User = {
      id: "guest",
      name: "Guest User",
      email: "",
      accountType: "customer",
      role: "customer",
      isGuest: true,
    }
    setUser(guestUser)
  }

  // ==========================================
  // 🔄 تحديث البيانات الشخصية
  // ==========================================
  const updateUserProfile = async (data: {
    name?: string
    phone?: string
    address?: string
  }) => {
    try {
      setLoading(true)
      // استخدام user-service لتحديث البيانات
      if (user) {
        // في الواقع، يجب استدعاء user-service.updateUser هنا
        // لكن في الوقت الحالي نحدث البيانات محليا
        setUser(prev => prev ? {
          ...prev,
          ...data,
        } : null)
      }
    } catch (error: any) {
      throw new Error(error.message || 'فشل تحديث البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 🔑 تغيير كلمة المرور
  // ==========================================
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true)
      await authService.changePassword({ currentPassword, newPassword })
    } catch (error: any) {
      throw new Error(error.message || 'فشل تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 🔐 تسجيل الدخول بـ Google
  // ==========================================
  const signInWithGoogle = async () => {
    // TODO: Implement Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 1000))
    throw new Error("Google Sign-In not implemented yet")
  }

  // ==========================================
  // ✅ Helper Properties
  // ==========================================
  const isAuthenticated = user !== null && !user.isGuest
  const isAdmin = user?.role === "admin"
  const isStoreOwner = user?.role === "merchant"
  const isCustomerService = user?.role === "customer_service"
  const isCustomer = user?.role === "customer"

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated,
        isAdmin,
        isStoreOwner,
        isCustomerService,
        isCustomer,
        continueAsGuest,
        signInWithGoogle,
        updateUserProfile,
        changePassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
