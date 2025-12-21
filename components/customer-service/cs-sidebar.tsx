"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { MessageSquare, BarChart3, Settings, Home, Store } from "lucide-react"

export function CSSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('customerService.sidebar')
  const tTitle = useTranslations('customerService')

  const links = [
    { href: `/${locale}/customer-service`, label: t('dashboard'), icon: Home },
    { href: `/${locale}/customer-service/conversations`, label: t('conversations'), icon: MessageSquare },
    { href: `/${locale}/customer-service/analytics`, label: t('analytics'), icon: BarChart3 },
    { href: `/${locale}/customer-service/settings`, label: t('settings'), icon: Settings },
  ]

  return (
    <aside className="w-64 bg-primary text-primary-foreground min-h-screen p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-serif">{tTitle('title')}</h2>
        <p className="text-sm opacity-80 mt-1">{tTitle('subtitle')}</p>
      </div>

      <Link
        href={`/${locale}`}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 mb-6 rounded-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors"
      >
        <Store className="w-4 h-4" />
        <span className="font-medium">{t('viewStore')}</span>
      </Link>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary-foreground text-primary" : "hover:bg-primary-foreground/10"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
