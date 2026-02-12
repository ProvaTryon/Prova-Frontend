"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Loader2, Mail, CheckCircle, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import * as forgotPasswordService from "@/lib/forgot-password-service"

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
    const t = useTranslations("auth")
    const siteName = useTranslations()('siteName')
    const router = useRouter()

    // Form state
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // UI state
    const [step, setStep] = useState<Step>("email")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [resendCountdown, setResendCountdown] = useState(0)

    // ==========================================
    // Step 1: Send OTP to Email
    // ==========================================
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address")
            return
        }

        setIsLoading(true)

        try {
            await forgotPasswordService.sendResetOTP(email)
            setStep("otp")
            setResendCountdown(60) // 60 seconds countdown

            // Start countdown timer
            const interval = setInterval(() => {
                setResendCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (err) {
            setError((err as Error).message || "Failed to send OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // ==========================================
    // Step 2: Verify OTP
    // ==========================================
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!otp || otp.length < 4) {
            setError("Please enter a valid OTP")
            return
        }

        setIsLoading(true)

        try {
            await forgotPasswordService.verifyResetOTP(email, otp)
            setStep("password")
        } catch (err) {
            setError((err as Error).message || "Invalid OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // ==========================================
    // Step 3: Reset Password
    // ==========================================
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)

        try {
            await forgotPasswordService.resetPassword(email, otp, newPassword, confirmPassword)
            setStep("success")
        } catch (err) {
            setError((err as Error).message || "Failed to reset password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // ==========================================
    // Render Step 1: Enter Email
    // ==========================================
    if (step === "email") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <span className="font-serif text-3xl font-semibold">{siteName}</span>
                        </Link>
                        <h1 className="font-serif text-3xl font-medium mt-6 mb-2">Reset Password</h1>
                        <p className="text-muted-foreground">Enter your email to receive a reset code</p>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-8">
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex gap-2">
                                    <span>⚠️</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center mb-6">
                                <Mail className="w-12 h-12 text-muted-foreground/50" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                                    placeholder="john@example.com"
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
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Code"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Remember your password? </span>
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // Render Step 2: Enter OTP
    // ==========================================
    if (step === "otp") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <span className="font-serif text-3xl font-semibold">{siteName}</span>
                        </Link>
                        <h1 className="font-serif text-3xl font-medium mt-6 mb-2">Verify Code</h1>
                        <p className="text-muted-foreground">We sent a code to {email}</p>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-8">
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex gap-2">
                                    <span>⚠️</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center mb-6">
                                <CheckCircle className="w-12 h-12 text-muted-foreground/50" />
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium mb-2">
                                    Enter Code
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                                    required
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono no-flip"
                                    placeholder="000000"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Check your email for the code
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Code"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={isLoading || resendCountdown > 0}
                                className="w-full py-2 text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendCountdown > 0 ? (
                                    <span>Resend code in {resendCountdown}s</span>
                                ) : (
                                    "Resend Code"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Go back to </span>
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // Render Step 3: Reset Password
    // ==========================================
    if (step === "password") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <span className="font-serif text-3xl font-semibold">{siteName}</span>
                        </Link>
                        <h1 className="font-serif text-3xl font-medium mt-6 mb-2">Create New Password</h1>
                        <p className="text-muted-foreground">Enter your new password below</p>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-8">
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex gap-2">
                                    <span>⚠️</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center mb-6">
                                <Lock className="w-12 h-12 text-muted-foreground/50" />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Minimum 6 characters
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                                    placeholder="Confirm new password"
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
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Go back to </span>
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // Render Step 4: Success
    // ==========================================
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="font-serif text-3xl font-semibold">{siteName}</span>
                    </Link>
                </div>

                <div className="bg-background border border-border rounded-lg p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    </div>

                    <h1 className="font-serif text-2xl font-medium text-center mb-2">Password Reset!</h1>
                    <p className="text-muted-foreground text-center mb-6">
                        Your password has been successfully reset. You can now sign in with your new password.
                    </p>

                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    )
}
