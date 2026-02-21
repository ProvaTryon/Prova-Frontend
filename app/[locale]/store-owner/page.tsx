"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { productService, type Product } from "@/lib/product-service"
import { Package, DollarSign, ShoppingCart, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function StoreOwnerDashboard() {
  const t = useTranslations('storeOwner.dashboard')
  const tStats = useTranslations('storeOwner.dashboard.stats')
  const params = useParams()
  const locale = params.locale as string
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch merchant's products from backend - filtered by merchant name
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Filter products by merchant name (user's name)
        if (user?.name) {
          const merchantProducts = await productService.getProductsByMerchantName(user.name)
          setProducts(merchantProducts || [])
        } else {
          // Fallback: no products if no merchant name
          setProducts([])
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [user?.name])

  const stats = [
    {
      label: tStats('totalProducts'),
      value: products.length,
      icon: Package,
      change: `+2 ${tStats('thisMonth')}`,
    },
    {
      label: tStats('totalSales'),
      value: 0,
      icon: ShoppingCart,
      change: `+12% ${tStats('fromLastMonth')}`,
    },
    {
      label: tStats('revenue'),
      value: `$0`,
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif mb-2">{t('welcome', { name: user?.name || 'User' })}</h1>
        <p className="text-muted-foreground">{t('subtitle', { storeName: 'Your Store' })}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -2 }}
              className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <p className="text-sm text-green-600">{stat.change}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
          <h2 className="text-xl font-serif mb-4">{t('recentProducts')}</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
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
          ) : (
            <p className="text-muted-foreground text-center py-8">No products found</p>
          )}
          <Link href={`/${locale}/store-owner/products`} className="text-sm text-primary hover:underline mt-4 inline-block">
            {t('viewAllProducts')} →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
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
        </motion.div>
      </div>
    </div>
  )
}
