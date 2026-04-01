"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Sparkles, Phone, MapPin, CalendarDays, User } from "lucide-react"
import { useTranslations } from "next-intl"

import { useAuth } from "@/lib/auth-context"
import { updateProfile, type UpdateProfilePayload } from "@/lib/profile-service"
import { useToast } from "@/hooks/use-toast"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ImageUpload, type UploadedImage } from "@/components/ui/image-upload"

// ── Validation schema ──────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, {
      message: "Enter a valid Egyptian phone number (e.g. 01012345678)",
    }),
  address: z.string().optional().default(""),
  birth_date: z.string().optional().default(""),
})

type FormValues = z.infer<typeof schema>

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ── Component ──────────────────────────────────────────
export function ProfileCompletionModal() {
  const t = useTranslations("auth")
  const { user, needsProfileCompletion, dismissProfileCompletion, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const [frontTryonImage, setFrontTryonImage] = useState<UploadedImage | null>(null)
  const [sideTryonImage, setSideTryonImage] = useState<UploadedImage | null>(null)
  const showTryonSection = user?.role === "customer"

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      birth_date: "",
    },
  })

  // Pre-fill name from Google when modal opens
  useEffect(() => {
    if (needsProfileCompletion && user) {
      const currentPhone = user.phone?.startsWith("google-") ? "" : (user.phone ?? "")
      form.reset({
        name: user.name || "",
        phone: currentPhone,
        address: user.address ?? "",
        birth_date: "",
      })
      setFrontTryonImage(null)
      setSideTryonImage(null)
    }
  }, [needsProfileCompletion, user, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: UpdateProfilePayload = { name: values.name, phone: values.phone }
      if (values.address) payload.address = values.address
      if (values.birth_date) payload.birth_date = values.birth_date
      if (showTryonSection && frontTryonImage?.secure_url) {
        payload.tryonImage = frontTryonImage.secure_url
      }
      if (showTryonSection && sideTryonImage?.secure_url) {
        payload.tryonSideImage = sideTryonImage.secure_url
      }

      await updateProfile(payload)

      // Update local auth state
      await updateUserProfile({ name: values.name, phone: values.phone, address: values.address })

      toast({
        title: "Profile completed!",
        description: "Welcome to Prova 🎉",
      })

      dismissProfileCompletion()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message || "Failed to save profile",
      })
    }
  }

  if (!needsProfileCompletion || !user) return null

  return (
    <Dialog open={needsProfileCompletion} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden gap-0 border-border shadow-xl"
        // Prevent closing by clicking outside — user should fill required fields
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        {/* Header band */}
        <div className="bg-primary/5 border-b border-border px-6 py-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-border">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="font-serif text-xl font-medium leading-tight">
                  {t("profileCompletionWelcome", {
                    name: user.name?.split(" ")[0] || t("profileCompletionFallbackName"),
                  })}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                  {t("profileCompletionDescription")}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("fullName")}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("namePlaceholder")} className="no-flip" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone — required */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("phoneNumber")}
                      <span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="01012345678"
                        className="no-flip"
                        inputMode="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Birth date */}
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("birthDate")}
                      <span className="text-xs text-muted-foreground ml-1">({t("optional")})</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="no-flip" />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("address")}
                      <span className="text-xs text-muted-foreground ml-1">({t("optional")})</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("addressPlaceholder")} className="no-flip" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showTryonSection && (
                <div className="space-y-3 rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium">{t("profileCompletionTryonTitle")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("profileCompletionTryonHint")}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ImageUpload
                      value={frontTryonImage}
                      onChange={setFrontTryonImage}
                      uploadType="user"
                      label={t("profileCompletionFrontImage")}
                    />
                    <ImageUpload
                      value={sideTryonImage}
                      onChange={setSideTryonImage}
                      uploadType="user"
                      label={t("profileCompletionSideImage")}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("saving")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t("saveAndContinue")}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={dismissProfileCompletion}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("skip")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
