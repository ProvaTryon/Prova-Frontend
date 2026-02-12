"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useEffect, useState } from "react"
import { User, Package, Heart, Settings, Loader2, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useWishlist } from "@/lib/wishlist-context"
import * as userService from "@/lib/user-service"
import Link from "next/link"

interface UserData {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  birth_date: string
  role: 'user' | 'merchant' | 'admin' | 'cs'
  isActive: boolean
  createdAt?: string
}

export default function ProfilePage() {
  const t = useTranslations("profile")
  const { user, isAuthenticated } = useAuth()
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editedData, setEditedData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birth_date: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Use auth context user data directly (avoid backend fetch that might fail)
    const setupUserData = async () => {
      try {
        setLoading(true)
        setError("")

        if (!user?.id) throw new Error("User ID not found")

        // Use user from auth context as the source of truth
        const userDataToUse = {
          _id: user.id,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          birth_date: (user as any).birth_date || "",
          role: user.role || "user",
          isActive: true
        }

        setUserData(userDataToUse as any)
        setEditedData({
          name: userDataToUse.name,
          email: userDataToUse.email,
          phone: userDataToUse.phone,
          address: userDataToUse.address,
          birth_date: userDataToUse.birth_date ? new Date(userDataToUse.birth_date).toISOString().split('T')[0] : "",
        })
      } catch (err) {
        console.error("Failed to setup user data:", err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    setupUserData()
  }, [isAuthenticated, router, user])

  const handleSaveChanges = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")

      if (!user?.id) throw new Error("User ID not found")

      const updatedData = {
        name: editedData.name,
        email: editedData.email,
        phone: editedData.phone,
        address: editedData.address,
        birth_date: editedData.birth_date,
      }

      // Try to update via backend
      try {
        const result = await userService.updateUser(user.id, updatedData)
        setSuccess("Profile updated successfully!")
        setUserData(prev => prev ? { ...prev, ...updatedData } : null)
      } catch (backendErr: any) {
        // Log the backend error for debugging
        console.error("Backend update error:", backendErr)

        // Show the actual error to the user
        const errorMsg = backendErr?.message || (backendErr as Error).message || "Failed to update profile"
        throw new Error(errorMsg)
      }
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError((err as Error).message || "Failed to update profile. Please check your connection.")
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
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

                    {error && (
                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                        {success}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-2">{t("fullName")}</label>
                        <input
                          id="fullName"
                          type="text"
                          value={editedData.name}
                          onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">{t("email")}</label>
                        <input
                          id="email"
                          type="email"
                          value={editedData.email}
                          onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">{t("phone")}</label>
                        <input
                          id="phone"
                          type="tel"
                          value={editedData.phone}
                          onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-2">{t("address")}</label>
                        <input
                          id="address"
                          type="text"
                          value={editedData.address}
                          onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium mb-2">{t("birthDate")}</label>
                        <input
                          id="birthDate"
                          type="date"
                          value={editedData.birth_date}
                          onChange={(e) => setEditedData({ ...editedData, birth_date: e.target.value })}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary no-flip"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-2">{t("accountType")}</label>
                        <input
                          id="role"
                          type="text"
                          value={userData?.role || ""}
                          disabled
                          className="w-full px-4 py-3 border border-border rounded-lg bg-muted"
                        />
                      </div>
                      <button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("saving")}
                          </span>
                        ) : (
                          t("saveChanges")
                        )}
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

                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">{t("noWishlistItems")}</p>
                        <Link href="/shop" className="text-primary hover:underline">
                          Continue shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="aspect-square mb-4 bg-muted rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-medium truncate">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.brand}</p>
                              <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                              <div className="flex gap-2 pt-4">
                                <Link
                                  href={`/product/${item.id}`}
                                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors text-sm"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => removeFromWishlist(item.id)}
                                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                  title="Remove from wishlist"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
