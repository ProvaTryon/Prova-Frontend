"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CSSettings() {
  const t = useTranslations("customerService.settings")
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert(t("savedSuccessfully"))
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="bg-card p-6 rounded-lg border space-y-6">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
        </div>

        <div>
          <Label>{t("role")}</Label>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {t("customerService")}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  )
}
