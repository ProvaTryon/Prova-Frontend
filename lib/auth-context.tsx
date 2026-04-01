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
  birth_date?: string
}

/** Returns true when the profile lacks a real phone number */
function profileIncomplete(user: User | null): boolean {
  if (!user || user.isGuest) return false
  return !user.phone || user.phone.startsWith('google-') || user.phone.trim() === ''
}

interface AuthContextType {
  user: User | null
  needsProfileCompletion: boolean
  dismissProfileCompletion: () => void
  login: (email: string, password: string) => Promise<User>
  signup: (name: string, email: string, password: string, role: "user" | "merchant", additionalData?: {
    companyName?: string;
    companyId?: string;
    nationalId?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    confirmPassword?: string;
    tryonImage?: string;
    tryonSideImage?: string;
  }) => Promise<{ email: string }>
  verifySignupOTP: (email: string, otp: string) => Promise<User>
  resendSignupOTP: (email: string) => Promise<void>
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

/**
 * Map backend role names to frontend role names.
 * Backend uses "cs" and "user", frontend uses "customer_service" and "customer".
 */
function mapRole(backendRole: string): User["role"] {
  switch (backendRole) {
    case "cs":
      return "customer_service"
    case "user":
      return "customer"
    default:
      return backendRole as User["role"]
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileCompletionDismissed, setProfileCompletionDismissed] = useState(false)

  const needsProfileCompletion = !profileCompletionDismissed && profileIncomplete(user)
  const dismissProfileCompletion = () => setProfileCompletionDismissed(true)

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
              id: String(userData.id || userData._id || ''),
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.address,
              role: mapRole(userData.role),
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

      console.log('🔑 Auth login response user:', JSON.stringify(response.user, null, 2))

      const userData: User = {
        id: String(response.user.id || response.user._id || ''),
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        address: response.user.address,
        role: mapRole(response.user.role),
        accountType: response.user.role === 'merchant' ? 'brand' : 'customer',
        storeId: response.user.storeId,
      }

      setUser(userData)
      setProfileCompletionDismissed(false)
      return userData
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل تسجيل الدخول'))
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
      tryonImage?: string;
      tryonSideImage?: string;
    }
  ): Promise<{ email: string }> => {
    try {
      setLoading(true)

      await authService.register({
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
        tryonImage: additionalData?.tryonImage,
        tryonSideImage: additionalData?.tryonSideImage,
      })

      // Don't set user yet - need OTP verification first
      return { email }
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل التسجيل'))
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // ✅ التحقق من OTP التسجيل
  // ==========================================
  const verifySignupOTP = async (email: string, otp: string): Promise<User> => {
    try {
      setLoading(true)

      const response = await authService.verifySignupOTP(email, otp)

      const userData: User = {
        id: String(response.user.id || response.user._id || ''),
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        address: response.user.address,
        role: mapRole(response.user.role),
        accountType: response.user.role === 'merchant' ? 'brand' : 'customer',
        storeId: response.user.storeId,
      }

      setUser(userData)
      setProfileCompletionDismissed(false)
      return userData
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل التحقق من الرمز'))
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 🔄 إعادة إرسال OTP التسجيل
  // ==========================================
  const resendSignupOTP = async (email: string): Promise<void> => {
    try {
      await authService.resendSignupOTP(email)
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل إعادة إرسال الرمز'))
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
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل تحديث البيانات'))
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
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل تغيير كلمة المرور'))
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // 🔐 تسجيل الدخول بـ Google
  // ==========================================
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const googleToken = await authService.getGoogleToken()
      const response = await authService.googleAuth(googleToken)

      const userData: User = {
        id: String(response.user.id || response.user._id || ''),
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        address: response.user.address,
        role: mapRole(response.user.role),
        accountType: response.user.role === 'merchant' ? 'brand' : 'customer',
        storeId: response.user.storeId,
      }

      setUser(userData)
      // Reset dismissal flag so modal shows for new login
      setProfileCompletionDismissed(false)
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'فشل تسجيل الدخول باستخدام Google'))
    } finally {
      setLoading(false)
    }
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
        needsProfileCompletion,
        dismissProfileCompletion,
        login,
        signup,
        verifySignupOTP,
        resendSignupOTP,
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
