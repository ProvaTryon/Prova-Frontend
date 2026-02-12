"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function SignupPage() {
  const t = useTranslations("auth")
  const siteName = useTranslations()('siteName')
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [accountType, setAccountType] = useState<"customer" | "brand">("customer")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  // Merchant fields
  const [companyName, setCompanyName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [nationalId, setNationalId] = useState("")

  const { signup, signInWithGoogle } = useAuth()
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

    // Check age (must be 13+)
    const birthDateObj = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate()) ? age - 1 : age

    if (actualAge < 13) {
      setError("You must be at least 13 years old to register")
      return
    }

    // Validate merchant fields if brand account
    if (accountType === "brand") {
      if (!companyName || !companyId || !nationalId) {
        setError("Please fill in all company information")
        return
      }
    }

    setIsLoading(true)

    try {
      // Determine role based on account type
      const role = accountType === "brand" ? "merchant" : "user"

      // Send data matching backend requirements
      await signup(name, email, password, role, {
        companyName: accountType === "brand" ? companyName : undefined,
        companyId: accountType === "brand" ? companyId : undefined,
        nationalId: accountType === "brand" ? nationalId : undefined,
        phone,
        address,
        birth_date: birthDate,
        confirmPassword,
      })
      router.push("/")
    } catch (err) {
      console.error("Signup error:", err)
      setError((err as Error).message || t("signupFailed"))
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-semibold">{siteName}</span>
          </Link>
          <h1 className="font-serif text-3xl font-medium mt-6 mb-2">{t("createAccount")}</h1>
          <p className="text-muted-foreground">{t("signUpSubtitle", { siteName })}</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-8">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("signingIn")}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("continueWithGoogle")}
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">{t("orContinueWithEmail")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium mb-3">{t("accountType")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={`py-3 px-4 border-2 rounded-lg transition-all ${accountType === "customer"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                    }`}
                >
                  {t("customer")}
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("brand")}
                  className={`py-3 px-4 border-2 rounded-lg transition-all ${accountType === "brand"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                    }`}
                >
                  {t("brand")}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {t("fullName")}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                placeholder={t("namePlaceholder")}
              />
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
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                placeholder="Your street address"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
                Birth Date
              </label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
              />
              <p className="text-xs text-muted-foreground mt-1">You must be at least 13 years old</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                placeholder={t("passwordPlaceholder")}
              />
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
                placeholder={t("passwordPlaceholder")}
              />
            </div>

            {/* Merchant/Brand Fields */}
            {accountType === "brand" && (
              <>
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium mb-4">Company Information</h3>
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={accountType === "brand"}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="companyId" className="block text-sm font-medium mb-2">
                    Company ID / Registration Number
                  </label>
                  <input
                    id="companyId"
                    type="text"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required={accountType === "brand"}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                    placeholder="Your company registration number"
                  />
                </div>

                <div>
                  <label htmlFor="nationalId" className="block text-sm font-medium mb-2">
                    National ID / Tax ID
                  </label>
                  <input
                    id="nationalId"
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    required={accountType === "brand"}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                    placeholder="Your national/tax ID"
                  />
                </div>
              </>
            )}

            <div className="text-sm text-muted-foreground">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary" />
                <span>
                  {t("agreeToTerms")}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("termsOfService")}
                  </Link>{" "}
                  {t("and")}{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    {t("privacyPolicy")}
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("creatingAccount")}
                </>
              ) : (
                t("signUp")
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("hasAccount")} </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
