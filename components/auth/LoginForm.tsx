"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSearchParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/routing"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { motion, type Variants } from "framer-motion"
import OTPVerification from "@/components/auth/otp-verification"

interface LoginFormProps {
  onSwitchToSignUp: () => void
}

export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const t = useTranslations("auth")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const [showOtp, setShowOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const { login, continueAsGuest, signInWithGoogle, verifySignupOTP, resendSignupOTP, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const getRedirectPath = (role?: string) => {
    const redirect = searchParams.get("redirect")
    if (redirect) return redirect
    switch (role) {
      case "admin": return "/admin"
      case "merchant": return "/store-owner"
      case "customer_service": return "/customer-service"
      default: return "/"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const loggedInUser = await login(email, password)
      router.push(getRedirectPath(loggedInUser.role))
    } catch (err: any) {
      const errorMessage = err?.message || t("invalidCredentials")
      if (errorMessage === "EMAIL_NOT_VERIFIED" || errorMessage.includes("EMAIL_NOT_VERIFIED")) {
        setShowOtp(true)
        setError("")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      router.push(getRedirectPath(user?.role))
    } catch (err: any) {
      setError(err?.message || t("googleSignInFailed"))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGuestCheckout = () => {
    continueAsGuest()
    router.push("/shop")
  }

  const handleVerifyFromLogin = async (otpCode: string) => {
    setIsVerifying(true)
    try {
      const userData = await verifySignupOTP(email, otpCode)
      router.push(getRedirectPath(userData.role))
    } catch (err: any) {
      setError(err?.message || "Invalid OTP. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendFromLogin = async () => {
    await resendSignupOTP(email)
  }

  if (showOtp) {
    return (
      <OTPVerification
        email={email}
        title={t("verifyEmail")}
        subtitle={t("emailNotVerifiedMsg")}
        onVerify={handleVerifyFromLogin}
        onResend={handleResendFromLogin}
        onBack={() => { setShowOtp(false); setError("") }}
        backLabel={t("backToLogin")}
        error={error}
        setError={setError}
        isVerifying={isVerifying}
      />
    )
  }

  const stagger: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-lg bg-muted/40 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm no-flip"

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Heading */}
      <motion.div variants={stagger} custom={0} className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {t("welcomeBack")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("signInSubtitle")}</p>
      </motion.div>

      {/* Google */}
      <motion.div variants={stagger} custom={1}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-3
            border border-border hover:bg-muted/60 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("continueWithGoogle")}
            </>
          )}
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={stagger} custom={2} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-3 bg-background text-muted-foreground tracking-wider">
            {t("orContinueWithEmail")}
          </span>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form variants={stagger} custom={3} onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-sm font-medium">{t("email")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder={t("emailPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-sm font-medium">{t("password")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputCls} !pr-11`}
              placeholder={t("passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
            <span className="text-muted-foreground">{t("rememberMe")}</span>
          </label>
          <Link href="/forgot-password" className="text-primary hover:underline underline-offset-4 font-medium text-sm">
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-semibold text-sm
            bg-primary text-primary-foreground
            hover:bg-primary/90 active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("signingIn")}
            </>
          ) : (
            t("signIn")
          )}
        </button>
      </motion.form>

      {/* Divider */}
      <motion.div variants={stagger} custom={4} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-background text-muted-foreground">{t("or")}</span>
        </div>
      </motion.div>

      {/* Guest */}
      <motion.div variants={stagger} custom={5}>
        <button
          type="button"
          onClick={handleGuestCheckout}
          className="w-full py-3 rounded-lg font-medium text-sm
            border border-border hover:bg-muted/60 transition-all duration-200"
        >
          {t("continueAsGuest")}
        </button>
      </motion.div>

      {/* Switch */}
      <motion.div variants={stagger} custom={6} className="text-center text-sm pt-1">
        <span className="text-muted-foreground">{t("noAccount")} </span>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
        >
          {t("signUp")}
        </button>
      </motion.div>
    </motion.div>
  )
}
