"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { LayoutDashboard, Package, Users, ShoppingCart, Settings, Store, Home } from "lucide-react"
import { motion } from "framer-motion"

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
        <motion.h2
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="font-serif text-xl font-semibold mb-4"
        >
          {useTranslations('admin')('title')}
        </motion.h2>

        <Link
          href={`/${locale}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 mb-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="font-medium">{t('backToStore')}</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
