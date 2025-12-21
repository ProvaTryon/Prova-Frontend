"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function LoginPage() {
  const t = useTranslations("auth")
  const siteName = useTranslations()('siteName')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, continueAsGuest, signInWithGoogle, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const getRedirectPath = () => {
    const redirect = searchParams.get("redirect")
    if (redirect) return redirect

    switch (user?.role) {
      case "admin":
        return "/admin"
      case "store_owner":
        return "/store-owner"
      case "customer_service":
        return "/customer-service"
      case "customer":
      default:
        return "/"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push(getRedirectPath())
    } catch (err) {
      setError(t("invalidCredentials"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle()
      router.push(getRedirectPath())
    } catch (err) {
      setError(t("googleSignInFailed"))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGuestCheckout = () => {
    continueAsGuest()
    router.push("/shop")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-semibold">{siteName}</span>
          </Link>
          <h1 className="font-serif text-3xl font-medium mt-6 mb-2">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground">{t("signInSubtitle")}</p>
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span>{t("rememberMe")}</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("signingIn")}
                </>
              ) : (
                t("signIn")
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">{t("or")}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestCheckout}
            className="w-full py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-all"
          >
            {t("continueAsGuest")}
          </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("noAccount")} </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              {t("signUp")}
            </Link>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-2">{t("testAccounts")}</p>
            <div className="text-xs space-y-1 text-muted-foreground no-flip">
              <p>Admin: admin@prova.com / admin123</p>
              <p>Store Owner: store@prova.com / store123</p>
              <p>Customer Service: cs@prova.com / cs123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
