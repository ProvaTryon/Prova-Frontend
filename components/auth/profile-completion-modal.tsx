"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Sparkles, Phone, MapPin, CalendarDays, User } from "lucide-react"
import { useTranslations } from "next-intl"

import { useAuth } from "@/lib/auth-context"
import { updateProfile } from "@/lib/profile-service"
import { useToast } from "@/hooks/use-toast"

import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  const { user, needsProfileCompletion, dismissProfileCompletion, updateUserProfile } = useAuth()
  const { toast } = useToast()

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
    }
  }, [needsProfileCompletion, user, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, string> = { name: values.name, phone: values.phone }
      if (values.address) payload.address = values.address
      if (values.birth_date) payload.birth_date = values.birth_date

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
                Welcome, {user.name?.split(" ")[0] || "there"}! 👋
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Complete your profile to get started
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
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Ahmed Mohamed" className="no-flip" />
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
                      Phone Number
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
                      Date of Birth
                      <span className="text-xs text-muted-foreground ml-1">(optional)</span>
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
                      Delivery Address
                      <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Street, City" className="no-flip" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Save & Continue
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={dismissProfileCompletion}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
