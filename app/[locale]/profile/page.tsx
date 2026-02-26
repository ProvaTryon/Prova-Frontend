"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useEffect, useState, useCallback } from "react"
import { User, Package, Heart, Settings, Loader2, Trash2, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { fetchProfile, updateProfile, type ProfileData } from "@/lib/profile-service"
import { getMyOrders } from "@/lib/order-service"
import Link from "next/link"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

// ── Zod schema for profile form (mirrors backend validation) ──
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, {
    message: "Invalid phone number (must be 11 digits starting with 010, 011, 012, or 015)",
  }),
  address: z.string().optional().default(""),
  birth_date: z.string().optional().default(""),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// ── Role badge color mapping ──
const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  merchant: "default",
  cs: "secondary",
  user: "outline",
}

export default function ProfilePage() {
  const t = useTranslations("profile")
  const { user, isAuthenticated, updateUserProfile } = useAuth()
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState("")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      birth_date: "",
    },
  })

  // ── Fetch profile from backend on mount ──
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        const data = await fetchProfile()
        setProfileData(data)

        // Pre-fill form with API data
        form.reset({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          birth_date: data.birth_date
            ? new Date(data.birth_date).toISOString().split("T")[0]
            : "",
        })
      } catch (err) {
        console.error("Failed to load profile:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: (err as Error).message || "Failed to load profile",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router])

  // ── Fetch orders when orders tab is activated ──
  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true)
      setOrdersError("")
      const data = await getMyOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load orders:", err)
      setOrdersError((err as Error).message || "Failed to load orders")
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      loadOrders()
    }
  }, [activeTab, isAuthenticated, loadOrders])

  // ── Submit handler ──
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const payload: Record<string, string | undefined> = {}
      if (values.name) payload.name = values.name
      if (values.phone) payload.phone = values.phone
      if (values.address !== undefined) payload.address = values.address
      if (values.birth_date) payload.birth_date = values.birth_date

      const updated = await updateProfile(payload)
      setProfileData(updated)

      // Sync local auth context
      updateUserProfile({
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message || "Failed to update profile",
      })
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
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl font-medium mb-8"
          >
            {t("myAccount")}
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-xl p-4 space-y-2 shadow-sm">
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
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="font-serif text-2xl font-medium">{t("profileInformation")}</h2>

                    {loading ? (
                      /* ── Loading skeleton ── */
                      <div className="space-y-5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                        <Skeleton className="h-10 w-36" />
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                          {/* Full Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("fullName")}</FormLabel>
                                <FormControl>
                                  <Input {...field} className="no-flip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email — read-only */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">{t("email")}</Label>
                            <Input
                              value={profileData?.email || ""}
                              readOnly
                              disabled
                              className="bg-muted cursor-not-allowed no-flip"
                            />
                          </div>

                          {/* Phone */}
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("phone")}</FormLabel>
                                <FormControl>
                                  <Input {...field} type="tel" className="no-flip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Address */}
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("address")}</FormLabel>
                                <FormControl>
                                  <Input {...field} className="no-flip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Birth Date */}
                          <FormField
                            control={form.control}
                            name="birth_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("birthDate")}</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" className="no-flip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Role — read-only badge */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">{t("accountType")}</Label>
                            <div>
                              <Badge variant={roleBadgeVariant[profileData?.role || "user"] ?? "outline"} className="text-sm capitalize">
                                {profileData?.role || "user"}
                              </Badge>
                            </div>
                          </div>

                          {/* Submit */}
                          <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="min-w-[140px]"
                          >
                            {form.formState.isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("saving")}
                              </span>
                            ) : (
                              t("saveChanges")
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </motion.div>
                )}

                {activeTab === "orders" && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="font-serif text-2xl font-medium">{t("orderHistory")}</h2>

                    {ordersLoading && (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border border-border rounded-lg p-5">
                            <div className="flex items-center justify-between mb-3">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!ordersLoading && ordersError && (
                      <div className="text-center py-12">
                        <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive/50" />
                        <p className="text-muted-foreground mb-3">{ordersError}</p>
                        <Button variant="outline" size="sm" onClick={loadOrders}>
                          {t("tryAgain") || "Try Again"}
                        </Button>
                      </div>
                    )}

                    {!ordersLoading && !ordersError && orders.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">{t("noOrders")}</p>
                        <Link href="/shop" className="text-sm text-primary hover:underline">
                          {t("startShopping") || "Start Shopping"}
                        </Link>
                      </div>
                    )}

                    {!ordersLoading && !ordersError && orders.length > 0 && (
                      <div className="space-y-4">
                        {orders.map((order: any) => {
                          const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
                            pending: { icon: <Clock className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30", label: t("statusPending") || "Pending" },
                            processing: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", label: t("statusProcessing") || "Processing" },
                            shipped: { icon: <Truck className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30", label: t("statusShipped") || "Shipped" },
                            delivered: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 bg-green-50 dark:bg-green-950/30", label: t("statusDelivered") || "Delivered" },
                            cancelled: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 dark:bg-red-950/30", label: t("statusCancelled") || "Cancelled" },
                          }
                          const status = statusConfig[order.status] || statusConfig.pending
                          const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                          const itemCount = order.items?.length || order.products?.length || 0

                          return (
                            <div key={order._id} className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-muted-foreground">#{order._id?.slice(-8)}</span>
                                  <span className="text-sm text-muted-foreground">{orderDate}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.icon}
                                  {status.label}
                                </span>
                              </div>

                              {/* Items preview */}
                              {order.items && order.items.length > 0 && (
                                <div className="flex gap-3 mb-3 overflow-x-auto pb-1">
                                  {order.items.slice(0, 4).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                                      {item.product?.image && (
                                        <img src={item.product.image} alt={item.product?.name || ''} className="w-10 h-10 rounded object-cover bg-muted" />
                                      )}
                                      <div className="text-xs">
                                        <p className="font-medium line-clamp-1 max-w-[120px]">{item.product?.name || 'Product'}</p>
                                        <p className="text-muted-foreground">x{item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {order.items.length > 4 && (
                                    <span className="text-xs text-muted-foreground self-center">+{order.items.length - 4} more</span>
                                  )}
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">
                                  {itemCount} {itemCount === 1 ? (t("item") || "item") : (t("items") || "items")}
                                </span>
                                <span className="text-sm font-semibold tabular-nums">${order.total?.toFixed(2)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "wishlist" && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
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
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
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
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
