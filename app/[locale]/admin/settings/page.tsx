"use client"

import { useTranslations } from "next-intl"

export default function SettingsPage() {
  const t = useTranslations('admin.settings')

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <p className="text-muted-foreground">{t('comingSoon')}</p>
      </div>
    </div>
  )
}
