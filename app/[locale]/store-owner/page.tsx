"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { mockStores, mockProducts } from "@/lib/mock-data"
import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function StoreOwnerDashboard() {
  const t = useTranslations('storeOwner.dashboard')
  const tStats = useTranslations('storeOwner.dashboard.stats')
  const params = useParams()
  const locale = params.locale as string
  const { user } = useAuth()
  const store = mockStores.find((s) => s.id === user?.storeId)
  const storeProducts = mockProducts.filter((p) => p.brand === store?.name)

  const stats = [
    {
      label: tStats('totalProducts'),
      value: storeProducts.length,
      icon: Package,
      change: `+2 ${tStats('thisMonth')}`,
    },
    {
      label: tStats('totalSales'),
      value: store?.totalSales || 0,
      icon: ShoppingCart,
      change: `+12% ${tStats('fromLastMonth')}`,
    },
    {
      label: tStats('revenue'),
      value: `$${(store?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: `+8% ${tStats('fromLastMonth')}`,
    },
    {
      label: tStats('conversionRate'),
      value: "3.2%",
      icon: TrendingUp,
      change: `+0.5% ${tStats('fromLastMonth')}`,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{t('welcome', { name: user?.name || 'User' })}</h1>
        <p className="text-muted-foreground">{t('subtitle', { storeName: store?.name || 'Your Store' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <p className="text-sm text-green-600">{stat.change}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-serif mb-4">{t('recentProducts')}</h2>
          <div className="space-y-4">
            {storeProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">${product.price}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {product.inStock ? t('inStock') : t('outOfStock')}
                </span>
              </div>
            ))}
          </div>
          <Link href={`/${locale}/store-owner/products`} className="text-sm text-primary hover:underline mt-4 inline-block">
            {t('viewAllProducts')} →
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-serif mb-4">{t('quickActions')}</h2>
          <div className="space-y-3">
            <Link
              href={`/${locale}/store-owner/products?action=add`}
              className="block p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-medium mb-1">{t('addNewProduct')}</h3>
              <p className="text-sm text-muted-foreground">{t('addNewProductDesc')}</p>
            </Link>
            <Link
              href={`/${locale}/store-owner/analytics`}
              className="block p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-medium mb-1">{t('viewAnalytics')}</h3>
              <p className="text-sm text-muted-foreground">{t('viewAnalyticsDesc')}</p>
            </Link>
            <Link
              href={`/${locale}/store-owner/settings`}
              className="block p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-medium mb-1">{t('storeSettings')}</h3>
              <p className="text-sm text-muted-foreground">{t('storeSettingsDesc')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
