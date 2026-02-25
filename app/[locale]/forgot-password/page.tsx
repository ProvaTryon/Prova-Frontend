"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Loader2, Mail, CheckCircle, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { motion } from "framer-motion"
import * as forgotPasswordService from "@/lib/forgot-password-service"
import OTPVerification from "@/components/auth/otp-verification"

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const tForgot = useTranslations("forgotPassword")
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [step, setStep] = useState<Step>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !email.includes("@")) {
      setError(tForgot("enterValidEmail"))
      return
    }
    setIsLoading(true)
    try {
      await forgotPasswordService.sendResetOTP(email)
      setStep("otp")
    } catch (err) {
      setError((err as Error).message || tForgot("failedToSendOTP"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (otpCode: string) => {
    setIsVerifying(true)
    try {
      await forgotPasswordService.verifyResetOTP(email, otpCode)
      setOtp(otpCode)
      setStep("password")
    } catch (err) {
      setError((err as Error).message || tForgot("invalidOTP"))
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    await forgotPasswordService.sendResetOTP(email)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"))
      return
    }
    if (newPassword.length < 6) {
      setError(tForgot("passwordMinLength"))
      return
    }
    setIsLoading(true)
    try {
      await forgotPasswordService.resetPassword(email, otp, newPassword, confirmPassword)
      setStep("success")
    } catch (err) {
      setError((err as Error).message || tForgot("failedToReset"))
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <OTPVerification
        email={email}
        title={tForgot("verifyCode")}
        subtitle={tForgot("codeSentDescription")}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onBack={() => { setStep("email"); setError("") }}
        backLabel={t("backToLogin")}
        error={error}
        setError={setError}
        isVerifying={isVerifying}
      />
    )
  }

  if (step === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Image
                  src="https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679326/Picture2_uyt4oe.png"
                  alt="Prova"
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain mx-auto"
                  priority
                />
              </motion.div>
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-serif text-3xl font-medium mt-6 mb-2"
            >
              {tForgot("title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-muted-foreground"
            >
              {tForgot("subtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background border border-border rounded-xl p-8 shadow-sm"
          >
            <form onSubmit={handleSendOTP} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
              )}

              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t("email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                  placeholder={t("emailPlaceholder")}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tForgot("sending")}
                  </>
                ) : (
                  tForgot("sendResetCode")
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{tForgot("rememberPassword")} </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("signIn")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (step === "password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Image
                  src="https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679326/Picture2_uyt4oe.png"
                  alt="Prova"
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain mx-auto"
                  priority
                />
              </motion.div>
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-serif text-3xl font-medium mt-6 mb-2"
            >
              {tForgot("createNewPassword")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-muted-foreground"
            >
              {tForgot("newPasswordSubtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background border border-border rounded-xl p-8 shadow-sm"
          >
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
              )}

              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  {tForgot("newPassword")}
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                  placeholder={tForgot("newPasswordPlaceholder")}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {tForgot("passwordMinLengthHint")}
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  {t("confirmPassword")}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                  placeholder={tForgot("confirmPasswordPlaceholder")}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tForgot("resetting")}
                  </>
                ) : (
                  tForgot("resetPassword")
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{tForgot("rememberPassword")} </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("signIn")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Image
                src="https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679326/Picture2_uyt4oe.png"
                alt="Prova"
                width={150}
                height={50}
                className="h-12 w-auto object-contain mx-auto"
                priority
              />
            </motion.div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-background border border-border rounded-xl p-8 shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="font-serif text-2xl font-medium text-center mb-2">
            {tForgot("successTitle")}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {tForgot("successMessage")}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
          >
            {t("signIn")}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
