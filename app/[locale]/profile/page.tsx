"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useEffect, useState, useCallback } from "react"
import {
  User,
  Package,
  Heart,
  Settings,
  Loader2,
  Trash2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Camera,
  Shield,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getMyOrders } from "@/lib/order-service"
import { refreshMeasurementsFromProfile } from "@/lib/measurement-service"
import Link from "next/link"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { ImageUpload, type UploadedImage } from "@/components/ui/image-upload"

// ── Zod schema for profile form ──
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, {
    message:
      "Invalid phone number (must be 11 digits starting with 010, 011, 012, or 015)",
  }),
  address: z.string().optional().default(""),
  birth_date: z.string().optional().default(""),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// ── Password change schema ──
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a digit")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface OrderProductSummary {
  image?: string
  name?: string
}

interface OrderItemSummary {
  product?: OrderProductSummary
  quantity?: number
}

interface OrderListItem {
  _id: string
  status?: string
  createdAt?: string
  items?: OrderItemSummary[]
  products?: unknown[]
  totalAmount?: number
  total?: number
  totalPrice?: number
}

// ── Role badge mapping ──
const roleBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  admin: "destructive",
  merchant: "default",
  cs: "secondary",
  user: "outline",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ═══════════════════════════════════════════════════════
// Profile Header Card
// ═══════════════════════════════════════════════════════
function ProfileHeader({
  name,
  email,
  role,
  provider,
  profileImage,
  updatedAt,
  loading,
}: {
  name: string
  email: string
  role: string
  provider: string
  profileImage?: string
  updatedAt?: string
  loading: boolean
}) {
  const t = useTranslations("profile")

  if (loading) {
    return (
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      {/* Avatar */}
      <div className="relative group">
        <Avatar className="h-20 w-20 border-2 border-border">
          {profileImage ? (
            <AvatarImage src={profileImage} alt={name} />
          ) : null}
          <AvatarFallback className="text-xl font-medium bg-primary/5 text-primary">
            {getInitials(name || "U")}
          </AvatarFallback>
        </Avatar>
        <button
          className="absolute inset-0 flex items-center justify-center rounded-full
                     bg-black/40 text-white opacity-0 group-hover:opacity-100
                     transition-opacity cursor-pointer"
          title="Change avatar"
          onClick={() => {
            /* avatar upload – future implementation */
          }}
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-serif text-2xl font-medium truncate">{name}</h2>
          <Badge
            variant={roleBadgeVariant[role] ?? "outline"}
            className="text-xs capitalize"
          >
            {role}
          </Badge>
          {provider === "google" && (
            <Badge
              variant="secondary"
              className="text-xs gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-0"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("connectedWithGoogle")}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{email}</p>
        {updatedAt && (
          <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {t("lastUpdated")}: {formatDate(updatedAt)}
          </p>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Password Change Section
// ═══════════════════════════════════════════════════════
function PasswordChangeSection({
  onSubmit,
}: {
  onSubmit: (current: string, newPwd: string) => Promise<void>
}) {
  const t = useTranslations("profile")
  const { toast } = useToast()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (values: PasswordFormValues) => {
    try {
      await onSubmit(values.currentPassword, values.newPassword)
      form.reset()
      toast({
        title: t("success"),
        description: t("passwordChanged"),
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: (err as Error).message || t("passwordChangeFailed"),
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium text-base">{t("changePassword")}</h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 max-w-md"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("currentPassword")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showCurrent ? "text" : "password"}
                      className="pr-10 no-flip"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrent(!showCurrent)}
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("newPassword")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showNew ? "text" : "password"}
                      className="pr-10 no-flip"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmNewPassword")}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" className="no-flip" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="outline"
            disabled={form.formState.isSubmitting}
            className="min-w-[160px]"
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("saving")}
              </span>
            ) : (
              t("changePassword")
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Main Profile Page
// ═══════════════════════════════════════════════════════
export default function ProfilePage() {
  const t = useTranslations("profile")
  const { user, isAuthenticated, updateUserProfile } = useAuth()
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState("")
  const [settingsFrontTryonImage, setSettingsFrontTryonImage] = useState<UploadedImage | null>(null)
  const [settingsSideTryonImage, setSettingsSideTryonImage] = useState<UploadedImage | null>(null)
  const [savingTryonSettings, setSavingTryonSettings] = useState(false)

  const {
    profile,
    loading,
    error: profileError,
    update: updateProfileData,
    changePassword,
    isGoogleUser,
  } = useCurrentUser()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      birth_date: "",
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        birth_date: profile.birth_date
          ? new Date(profile.birth_date).toISOString().split("T")[0]
          : "",
      })
    }
  }, [profile, form])

  useEffect(() => {
    if (!profile) return

    setSettingsFrontTryonImage(
      profile.tryonImage
        ? {
            secure_url: profile.tryonImage,
            public_id: "",
          }
        : null,
    )

    setSettingsSideTryonImage(
      profile.tryonSideImage
        ? {
            secure_url: profile.tryonSideImage,
            public_id: "",
          }
        : null,
    )
  }, [profile?.tryonImage, profile?.tryonSideImage, profile])

  // Show error toast
  useEffect(() => {
    if (profileError) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: profileError,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileError])

  // ── Fetch orders when tab activates ──
  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true)
      setOrdersError("")
      const data = await getMyOrders()
      setOrders(Array.isArray(data) ? (data as OrderListItem[]) : [])
    } catch (err) {
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

  // ── Submit profile ──
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const payload: Record<string, string | undefined> = {}
      if (values.name) payload.name = values.name
      if (values.phone) payload.phone = values.phone
      if (values.address !== undefined) payload.address = values.address
      if (values.birth_date) payload.birth_date = values.birth_date

      const updated = await updateProfileData(payload)

      updateUserProfile({
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      })

      toast({ title: t("success"), description: t("profileUpdated") })
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: (err as Error).message || t("updateFailed"),
      })
    }
  }

  const onSaveTryonSettings = async () => {
    try {
      setSavingTryonSettings(true)

      const currentFrontTryonImage = profile?.tryonImage || ""
      const currentSideTryonImage = profile?.tryonSideImage || ""
      const nextFrontTryonImage = settingsFrontTryonImage?.secure_url || ""
      const nextSideTryonImage = settingsSideTryonImage?.secure_url || ""

      const imagesChanged =
        currentFrontTryonImage !== nextFrontTryonImage ||
        currentSideTryonImage !== nextSideTryonImage

      const payload: Record<string, string> = {}
      if (nextFrontTryonImage) {
        payload.tryonImage = nextFrontTryonImage
      }
      if (nextSideTryonImage) {
        payload.tryonSideImage = nextSideTryonImage
      }

      if (!payload.tryonImage && !payload.tryonSideImage) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("tryonNoImageSelected"),
        })
        return
      }

      const updated = await updateProfileData(payload)

      setSettingsFrontTryonImage(
        updated.tryonImage
          ? {
              secure_url: updated.tryonImage,
              public_id: "",
            }
          : null,
      )

      setSettingsSideTryonImage(
        updated.tryonSideImage
          ? {
              secure_url: updated.tryonSideImage,
              public_id: "",
            }
          : null,
      )

      let measurementRefreshFailed = false
      let measurementRefreshSkipped = false

      if (imagesChanged) {
        if (updated.tryonImage && updated.tryonSideImage) {
          try {
            await refreshMeasurementsFromProfile({ engine: "mediapipe" })
          } catch {
            measurementRefreshFailed = true
          }
        } else {
          measurementRefreshSkipped = true
        }
      }

      if (measurementRefreshFailed) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("measurementRefreshFailed"),
        })
      } else if (measurementRefreshSkipped) {
        toast({
          title: t("success"),
          description: t("measurementRefreshSkipped"),
        })
      } else if (imagesChanged) {
        toast({
          title: t("success"),
          description: t("tryonSettingsSavedAndMeasured"),
        })
      } else {
        toast({
          title: t("success"),
          description: t("tryonSettingsSaved"),
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: (err as Error).message || t("updateFailed"),
      })
    } finally {
      setSavingTryonSettings(false)
    }
  }

  if (!isAuthenticated) return null

  const showTryonSettings = profile?.role === "user" || user?.role === "customer"

  const tabs = [
    { id: "profile", label: t("profile"), icon: User },
    { id: "orders", label: t("orders"), icon: Package },
    { id: "wishlist", label: t("myWishlist"), icon: Heart },
    { id: "settings", label: t("settings"), icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-serif text-3xl font-medium mb-8"
          >
            {t("myAccount")}
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* ── Sidebar ── */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <nav className="bg-card border border-border rounded-xl p-3 space-y-1 shadow-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </motion.aside>

            {/* ── Content ── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* ═══════════ PROFILE TAB ═══════════ */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 sm:p-8 space-y-8"
                    >
                      {/* Header card */}
                      <ProfileHeader
                        name={profile?.name || user?.name || ""}
                        email={profile?.email || user?.email || ""}
                        role={profile?.role || "user"}
                        provider={profile?.provider || "local"}
                        profileImage={profile?.profileImage}
                        updatedAt={profile?.updatedAt}
                        loading={loading}
                      />

                      <Separator />

                      {/* Profile form */}
                      <div>
                        <h3 className="font-serif text-xl font-medium mb-6">
                          {t("profileInformation")}
                        </h3>

                        {loading ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Form {...form}>
                            <form
                              onSubmit={form.handleSubmit(onSubmit)}
                              className="space-y-8"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
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
                                  <Label className="text-sm font-medium">
                                    {t("email")}
                                  </Label>
                                  <Input
                                    value={profile?.email || ""}
                                    readOnly
                                    disabled
                                    className="bg-muted/50 cursor-not-allowed no-flip"
                                  />
                                  {isGoogleUser && (
                                    <p className="text-xs text-muted-foreground">
                                      {t("emailManagedByGoogle")}
                                    </p>
                                  )}
                                </div>

                                {/* Phone */}
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t("phone")}</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="tel"
                                          className="no-flip"
                                        />
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
                                        <Input
                                          {...field}
                                          type="date"
                                          className="no-flip"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Address — full width */}
                                <div className="md:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t("address")}</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            className="no-flip"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* Account Type — read-only badge */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    {t("accountType")}
                                  </Label>
                                  <div>
                                    <Badge
                                      variant={
                                        roleBadgeVariant[
                                          profile?.role || "user"
                                        ] ?? "outline"
                                      }
                                      className="text-sm capitalize pointer-events-none"
                                    >
                                      {profile?.role || "user"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Submit */}
                              <div className="flex items-center gap-4">
                                <Button
                                  type="submit"
                                  disabled={form.formState.isSubmitting}
                                  className="min-w-[160px]"
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
                              </div>
                            </form>
                          </Form>
                        )}
                      </div>

                      {/* Password change — only for local accounts */}
                      {!loading && !isGoogleUser && (
                        <>
                          <Separator />
                          <PasswordChangeSection onSubmit={changePassword} />
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* ═══════════ ORDERS TAB ═══════════ */}
                  {activeTab === "orders" && (
                    <motion.div
                      key="orders"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 sm:p-8 space-y-6"
                    >
                      <h2 className="font-serif text-xl font-medium">
                        {t("orderHistory")}
                      </h2>

                      {ordersLoading && (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="border border-border rounded-lg p-5"
                            >
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
                        <div className="text-center py-16">
                          <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive/40" />
                          <p className="text-sm text-muted-foreground mb-4">
                            {ordersError}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadOrders}
                          >
                            {t("tryAgain") || "Try Again"}
                          </Button>
                        </div>
                      )}

                      {!ordersLoading &&
                        !ordersError &&
                        orders.length === 0 && (
                          <div className="text-center py-16">
                            <Package className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground mb-4">
                              {t("noOrders")}
                            </p>
                            <Link
                              href="/shop"
                              className="text-sm text-primary hover:underline"
                            >
                              {t("startShopping") || "Start Shopping"}
                            </Link>
                          </div>
                        )}

                      {!ordersLoading &&
                        !ordersError &&
                        orders.length > 0 && (
                          <div className="space-y-3">
                            {orders.map((order) => {
                              const statusConfig: Record<
                                string,
                                {
                                  icon: React.ReactNode
                                  color: string
                                  label: string
                                }
                              > = {
                                pending: {
                                  icon: <Clock className="w-3.5 h-3.5" />,
                                  color:
                                    "text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
                                  label: t("statusPending") || "Pending",
                                },
                                processing: {
                                  icon: (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ),
                                  color:
                                    "text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300",
                                  label:
                                    t("statusProcessing") || "Processing",
                                },
                                shipped: {
                                  icon: <Truck className="w-3.5 h-3.5" />,
                                  color:
                                    "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-300",
                                  label: t("statusShipped") || "Shipped",
                                },
                                delivered: {
                                  icon: (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ),
                                  color:
                                    "text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-300",
                                  label:
                                    t("statusDelivered") || "Delivered",
                                },
                                cancelled: {
                                  icon: <XCircle className="w-3.5 h-3.5" />,
                                  color:
                                    "text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-300",
                                  label:
                                    t("statusCancelled") || "Cancelled",
                                },
                              }
                              const statusKey = order.status ?? "pending"
                              const status =
                                statusConfig[statusKey] || statusConfig.pending
                              const orderDate = new Date(
                                order.createdAt ?? Date.now(),
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                              const itemCount =
                                order.items?.length ||
                                order.products?.length ||
                                0

                              return (
                                <div
                                  key={order._id}
                                  className="border border-border rounded-lg p-5 hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-mono text-muted-foreground">
                                        #{order._id?.slice(-8)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {orderDate}
                                      </span>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                                    >
                                      {status.icon}
                                      {status.label}
                                    </span>
                                  </div>

                                  {order.items && order.items.length > 0 && (
                                    <div className="flex gap-3 mb-3 overflow-x-auto pb-1">
                                      {order.items
                                        .slice(0, 4)
                                        .map((item: OrderItemSummary, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-2 flex-shrink-0"
                                          >
                                            {item.product?.image && (
                                              <img
                                                src={item.product.image}
                                                alt={
                                                  item.product?.name || ""
                                                }
                                                className="w-10 h-10 rounded object-cover bg-muted"
                                              />
                                            )}
                                            <div className="text-xs">
                                              <p className="font-medium line-clamp-1 max-w-[120px]">
                                                {item.product?.name ||
                                                  "Product"}
                                              </p>
                                              <p className="text-muted-foreground">
                                                x{item.quantity}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      {order.items.length > 4 && (
                                        <span className="text-xs text-muted-foreground self-center">
                                          +{order.items.length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                    <span className="text-xs text-muted-foreground">
                                      {itemCount}{" "}
                                      {itemCount === 1
                                        ? t("item") || "item"
                                        : t("items") || "items"}
                                    </span>
                                    <span className="text-sm font-semibold tabular-nums">
                                      ${order.total?.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                    </motion.div>
                  )}

                  {/* ═══════════ WISHLIST TAB ═══════════ */}
                  {activeTab === "wishlist" && (
                    <motion.div
                      key="wishlist"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 sm:p-8 space-y-6"
                    >
                      <h2 className="font-serif text-xl font-medium">
                        {t("myWishlist")}
                      </h2>

                      {wishlistItems.length === 0 ? (
                        <div className="text-center py-16">
                          <Heart className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground mb-4">
                            {t("noWishlistItems")}
                          </p>
                          <Link
                            href="/shop"
                            className="text-sm text-primary hover:underline"
                          >
                            Continue shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {wishlistItems.map((item) => (
                            <div
                              key={item.id}
                              className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <h3 className="font-medium text-sm truncate">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {item.brand}
                                </p>
                                <p className="text-base font-semibold">
                                  ${item.price.toFixed(2)}
                                </p>
                                <div className="flex gap-2 pt-3">
                                  <Link
                                    href={`/product/${item.id}`}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors text-xs font-medium"
                                  >
                                    View
                                  </Link>
                                  <button
                                    onClick={() =>
                                      removeFromWishlist(item.id)
                                    }
                                    className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ═══════════ SETTINGS TAB ═══════════ */}
                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 sm:p-8 space-y-6"
                    >
                      <h2 className="font-serif text-xl font-medium">
                        {t("accountSettings")}
                      </h2>
                      <div className="space-y-6 max-w-md">
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium">
                            {t("notifications")}
                          </h3>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                            />
                            <span className="text-sm text-muted-foreground">
                              {t("emailNotifications")}
                            </span>
                          </label>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium">
                            {t("privacy")}
                          </h3>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                            />
                            <span className="text-sm text-muted-foreground">
                              {t("showProfile")}
                            </span>
                          </label>
                        </div>

                        {showTryonSettings && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium">{t("tryonSettingsTitle")}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{t("tryonSettingsHint")}</p>
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <ImageUpload
                                  value={settingsFrontTryonImage}
                                  onChange={setSettingsFrontTryonImage}
                                  uploadType="user"
                                  label={t("tryonFrontImage")}
                                />
                                <ImageUpload
                                  value={settingsSideTryonImage}
                                  onChange={setSettingsSideTryonImage}
                                  uploadType="user"
                                  label={t("tryonSideImage")}
                                />
                              </div>

                              <Button
                                type="button"
                                onClick={onSaveTryonSettings}
                                disabled={savingTryonSettings}
                              >
                                {savingTryonSettings ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("saving")}
                                  </span>
                                ) : (
                                  t("tryonSave")
                                )}
                              </Button>
                            </div>
                          </>
                        )}
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
