"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Link, useRouter } from "@/i18n/routing"
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import OTPVerification from "@/components/auth/otp-verification"

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

type Step = "form" | "otp"

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const t = useTranslations("auth")
  const siteName = useTranslations()("siteName")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [accountType, setAccountType] = useState<"customer" | "brand">("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  // OTP state
  const [step, setStep] = useState<Step>("form")
  const [isVerifying, setIsVerifying] = useState(false)

  // Merchant fields
  const [companyName, setCompanyName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [nationalId, setNationalId] = useState("")

  const { signup, signInWithGoogle, verifySignupOTP, resendSignupOTP } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"))
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (name.length < 3 || name.length > 50) {
      setError("Name must be between 3 and 50 characters")
      return
    }
    if (phone.length < 10) {
      setError("Phone number must be at least 10 characters")
      return
    }
    if (address.length < 5) {
      setError("Address must be at least 5 characters")
      return
    }
    if (!birthDate) {
      setError("Birth date is required")
      return
    }

    const birthDateObj = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate()) ? age - 1 : age

    if (actualAge < 13) {
      setError("You must be at least 13 years old to register")
      return
    }

    if (accountType === "brand" && (!companyName || !companyId || !nationalId)) {
      setError("Please fill in all company information")
      return
    }

    setIsLoading(true)
    try {
      const role = accountType === "brand" ? "merchant" : "user"
      await signup(name, email, password, role, {
        companyName: accountType === "brand" ? companyName : undefined,
        companyId: accountType === "brand" ? companyId : undefined,
        nationalId: accountType === "brand" ? nationalId : undefined,
        phone,
        address,
        birth_date: birthDate,
        confirmPassword,
      })
      setStep("otp")
    } catch (err) {
      setError((err as Error).message || t("signupFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (otpCode: string) => {
    setIsVerifying(true)
    try {
      const userData = await verifySignupOTP(email, otpCode)
      router.push(userData.role === "merchant" ? "/store-owner" : "/")
    } catch (err) {
      setError((err as Error).message || "Invalid OTP. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    await resendSignupOTP(email)
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      router.push("/")
    } catch (err) {
      setError(t("googleSignInFailed"))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <OTPVerification
        email={email}
        title={t("verifyEmail")}
        subtitle={t("verifyEmailSubtitle") || "Please verify your email to complete registration"}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onBack={() => { setStep("form"); setError("") }}
        backLabel={t("backToSignup")}
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
      transition: { delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-lg bg-muted/40 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm no-flip"

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={stagger} custom={0} className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {t("createAccount")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("signUpSubtitle", { siteName })}
        </p>
      </motion.div>

      {/* Google Sign In */}
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
      <motion.form variants={stagger} custom={3} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Account Type */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">{t("accountType")}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("customer")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                accountType === "customer"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {t("customer")}
            </button>
            <button
              type="button"
              onClick={() => setAccountType("brand")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                accountType === "brand"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {t("brand")}
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="block text-sm font-medium">{t("fullName")}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder={t("namePlaceholder")} />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-sm font-medium">{t("email")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} placeholder={t("emailPlaceholder")} />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="signup-phone" className="block text-sm font-medium">{t("phoneNumber")}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="signup-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="+1 234 567 8900" />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label htmlFor="signup-address" className="block text-sm font-medium">{t("address")}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="signup-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputCls} placeholder={t("addressPlaceholder")} />
          </div>
        </div>

        {/* Birth Date */}
        <div className="space-y-1.5">
          <label htmlFor="signup-birthdate" className="block text-sm font-medium">{t("birthDate")}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="signup-birthdate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required className={inputCls} />
          </div>
          <p className="text-xs text-muted-foreground">{t("ageRequirement")}</p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-sm font-medium">{t("password")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputCls} !pr-11`}
              placeholder={t("passwordPlaceholder")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-confirm-password" className="block text-sm font-medium">{t("confirmPassword")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${inputCls} !pr-11`}
              placeholder={t("passwordPlaceholder")}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Merchant Fields */}
        <AnimatePresence>
          {accountType === "brand" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden space-y-4"
            >
              <div className="border-t border-border pt-4">
                <h3 className="font-medium text-sm mb-3">{t("companyInfo")}</h3>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-company" className="block text-sm font-medium">{t("companyName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="signup-company" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required={accountType === "brand"} className={inputCls} placeholder={t("companyNamePlaceholder")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-companyid" className="block text-sm font-medium">{t("companyId")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="signup-companyid" type="text" value={companyId} onChange={(e) => setCompanyId(e.target.value)} required={accountType === "brand"} className={inputCls} placeholder={t("companyIdPlaceholder")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-nationalid" className="block text-sm font-medium">{t("nationalId")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="signup-nationalid" type="text" value={nationalId} onChange={(e) => setNationalId(e.target.value)} required={accountType === "brand"} className={inputCls} placeholder={t("nationalIdPlaceholder")} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms */}
        <div className="text-sm text-muted-foreground">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded accent-primary" />
            <span>
              {t("agreeToTerms")}{" "}
              <Link href="/terms" className="text-primary hover:underline">{t("termsOfService")}</Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" className="text-primary hover:underline">{t("privacyPolicy")}</Link>
            </span>
          </label>
        </div>

        {/* Submit */}
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
              {t("creatingAccount")}
            </>
          ) : (
            t("signUp")
          )}
        </button>
      </motion.form>

      {/* Switch */}
      <motion.div variants={stagger} custom={4} className="text-center text-sm pt-1">
        <span className="text-muted-foreground">{t("hasAccount")} </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
        >
          {t("signIn")}
        </button>
      </motion.div>
    </motion.div>
  )
}
