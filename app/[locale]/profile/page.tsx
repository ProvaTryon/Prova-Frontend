"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useEffect, useState } from "react"
import { User, Package, Heart, Settings } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ProfilePage() {
  const t = useTranslations("profile")
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-serif text-4xl font-medium mb-8">{t("myAccount")}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  <User className="w-5 h-5" />
                  {t("profile")}
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  <Package className="w-5 h-5" />
                  {t("orders")}
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "wishlist" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  <Heart className="w-5 h-5" />
                  {t("myWishlist")}
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  <Settings className="w-5 h-5" />
                  {t("settings")}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg p-6">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-medium">{t("profileInformation")}</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-2">{t("fullName")}</label>
                        <input
                          id="fullName"
                          type="text"
                          defaultValue={user.name}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">{t("email")}</label>
                        <input
                          id="email"
                          type="email"
                          defaultValue={user.email}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="accountType" className="block text-sm font-medium mb-2">{t("accountType")}</label>
                        <input
                          id="accountType"
                          type="text"
                          value={user.accountType === "customer" ? t("customer") : t("brand")}
                          disabled
                          className="w-full px-4 py-3 border border-border rounded-lg bg-muted"
                        />
                      </div>
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">
                        {t("saveChanges")}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-medium">{t("orderHistory")}</h2>
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{t("noOrders")}</p>
                    </div>
                  </div>
                )}

                {activeTab === "wishlist" && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-medium">{t("myWishlist")}</h2>
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{t("noWishlistItems")}</p>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-medium">{t("accountSettings")}</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">{t("notifications")}</h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{t("emailNotifications")}</span>
                        </label>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">{t("privacy")}</h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{t("showProfile")}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
