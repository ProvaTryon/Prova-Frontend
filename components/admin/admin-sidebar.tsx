"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { LayoutDashboard, Package, Users, ShoppingCart, Settings, Store, Home } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('admin.sidebar')

  const navItems = [
    {
      name: t('dashboard'),
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
    },
    {
      name: t('stores'),
      href: `/${locale}/admin/stores`,
      icon: Store,
    },
    {
      name: t('products'),
      href: `/${locale}/admin/products`,
      icon: Package,
    },
    {
      name: t('users'),
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      name: t('orders'),
      href: `/${locale}/admin/orders`,
      icon: ShoppingCart,
    },
    {
      name: t('settings'),
      href: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ]

  return (
    <aside className="w-64 bg-muted/30 border-r border-border min-h-screen">
      <div className="p-6">
        <h2 className="font-serif text-xl font-semibold mb-4">{useTranslations('admin')('title')}</h2>

        <Link
          href={`/${locale}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 mb-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="font-medium">{t('backToStore')}</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
