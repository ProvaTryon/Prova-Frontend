"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link } from "@/i18n/routing"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { motion } from "framer-motion"

interface OTPVerificationProps {
  email: string
  title: string
  subtitle: string
  onVerify: (otpCode: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  backLabel: string
  error: string
  setError: (error: string) => void
  isVerifying: boolean
}

export default function OTPVerification({
  email,
  title,
  subtitle,
  onVerify,
  onResend,
  onBack,
  backLabel,
  error,
  setError,
  isVerifying,
}: OTPVerificationProps) {
  const t = useTranslations("auth")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendCountdown, setResendCountdown] = useState(60)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCountdown > 0) {
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendCountdown])

  // Auto-focus first input on mount
  useEffect(() => {
    otpRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste (multi-digit)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6)
      const newOtp = [...otp]
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newOtp[index + i] = digits[i]
      }
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError(t("enterFullCode") || "Please enter the full 6-digit code")
      return
    }

    await onVerify(otpCode)
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    setError("")

    try {
      await onResend()
      setResendCountdown(60)
      setOtp(["", "", "", "", "", ""])
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError((err as Error).message || "Failed to resend code")
    }
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
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-medium mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {subtitle}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {t("otpSentTo")} <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
            )}

            <div className="flex justify-center gap-2" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("verifying")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t("verifyAndContinue")}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("didntReceiveCode")}{" "}
              {resendCountdown > 0 ? (
                <span className="text-primary font-medium">
                  {t("resendIn")} {resendCountdown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-primary hover:underline font-medium"
                >
                  {t("resendCode")}
                </button>
              )}
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
