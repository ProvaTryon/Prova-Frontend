"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { TrendingUp, DollarSign, ShoppingCart, Users, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { productService, type Product } from "@/lib/product-service"
import * as orderService from "@/lib/order-service"

interface OrderUser {
  _id?: string
  id?: string
  email?: string
}

interface OrderProductRef {
  _id?: string
  id?: string
  name?: string
  price?: number
  merchantName?: string
}

interface OrderItem {
  product?: OrderProductRef | string
  quantity?: number
  price?: number
}

interface MerchantOrder {
  _id: string
  user?: OrderUser | string
  items?: OrderItem[]
  products?: Array<OrderProductRef | string>
  total?: number
  createdAt?: string
}

interface SalesPoint {
  key: string
  month: string
  sales: number
}

interface TopProductPoint {
  name: string
  sales: number
  revenue: number
}

interface AnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  customers: number
  revenueChange: string
  ordersChange: string
  avgOrderChange: string
  customersChange: string
  salesData: SalesPoint[]
  topProducts: TopProductPoint[]
}

const toMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

const createLastSixMonthsBuckets = (): SalesPoint[] => {
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: toMonthKey(date),
      month: date.toLocaleString(undefined, { month: "short" }),
      sales: 0,
    }
  })
}

const emptyAnalytics = (): AnalyticsSummary => ({
  totalRevenue: 0,
  totalOrders: 0,
  avgOrderValue: 0,
  customers: 0,
  revenueChange: "0%",
  ordersChange: "0%",
  avgOrderChange: "0%",
  customersChange: "0%",
  salesData: createLastSixMonthsBuckets(),
  topProducts: [],
})

const extractId = (entity: { _id?: string; id?: string } | string | undefined): string | null => {
  if (!entity) return null
  if (typeof entity === "string") return entity
  if (typeof entity._id === "string") return entity._id
  if (typeof entity.id === "string") return entity.id
  return null
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const getPercentChange = (current: number, previous: number): string => {
  if (previous === 0) {
    if (current === 0) return "0%"
    return "+100%"
  }

  const change = ((current - previous) / previous) * 100
  const rounded = Math.round(change * 10) / 10
  return `${rounded >= 0 ? "+" : ""}${rounded}%`
}

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function StoreOwnerAnalytics() {
  const t = useTranslations("storeOwner.analytics")
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(emptyAnalytics)

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) {
        setAnalytics(emptyAnalytics())
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [merchantProducts, ordersData] = await Promise.all([
          productService.getProductsByMerchant(user.id),
          orderService.getAllOrders(),
        ])

        const allOrders: MerchantOrder[] = Array.isArray(ordersData) ? (ordersData as MerchantOrder[]) : []

        const merchantProductIds = new Set(merchantProducts.map((product) => product.id))
        const productNameById = new Map(merchantProducts.map((product) => [product.id, product.name]))
        const merchantName = user.name.toLowerCase()

        const salesData = createLastSixMonthsBuckets()
        const salesByKey = new Map(salesData.map((point) => [point.key, point]))
        const currentMonthKey = salesData[5]?.key ?? ""
        const previousMonthKey = salesData[4]?.key ?? ""

        const productStats = new Map<string, TopProductPoint>()
        const uniqueCustomers = new Set<string>()
        const currentMonthCustomers = new Set<string>()
        const previousMonthCustomers = new Set<string>()

        let totalRevenue = 0
        let totalOrders = 0

        let currentMonthRevenue = 0
        let previousMonthRevenue = 0
        let currentMonthOrders = 0
        let previousMonthOrders = 0

        const belongsToMerchant = (productRef: OrderProductRef | string | undefined): boolean => {
          const productId = extractId(productRef)
          if (productId && merchantProductIds.has(productId)) {
            return true
          }

          if (productRef && typeof productRef === "object" && typeof productRef.merchantName === "string") {
            return productRef.merchantName.toLowerCase() === merchantName
          }

          return false
        }

        const updateProductStats = (
          productId: string | null,
          fallbackName: string,
          quantity: number,
          revenue: number,
        ) => {
          const resolvedName =
            (productId ? productNameById.get(productId) : undefined) ||
            fallbackName ||
            "Unknown Product"

          const statKey = productId || resolvedName
          const current = productStats.get(statKey) || {
            name: resolvedName,
            sales: 0,
            revenue: 0,
          }

          current.name = resolvedName
          current.sales += quantity
          current.revenue += revenue
          productStats.set(statKey, current)
        }

        for (const order of allOrders) {
          const customerId = extractId(order.user)
          const orderDate = order.createdAt ? new Date(order.createdAt) : null
          const monthKey =
            orderDate && !Number.isNaN(orderDate.getTime())
              ? toMonthKey(orderDate)
              : null

          let merchantOrderRevenue = 0
          let hasMerchantProduct = false

          if (Array.isArray(order.items) && order.items.length > 0) {
            for (const item of order.items) {
              const productRef = item.product
              if (!belongsToMerchant(productRef)) continue

              hasMerchantProduct = true

              const quantity = Math.max(1, Math.trunc(toNumber(item.quantity, 1)))
              const productPrice =
                productRef && typeof productRef === "object"
                  ? toNumber(productRef.price, 0)
                  : 0
              const unitPrice = toNumber(item.price, productPrice)
              const lineRevenue = quantity * unitPrice

              merchantOrderRevenue += lineRevenue

              const productId = extractId(productRef)
              const fallbackName =
                productRef && typeof productRef === "object" && typeof productRef.name === "string"
                  ? productRef.name
                  : ""

              updateProductStats(productId, fallbackName, quantity, lineRevenue)
            }
          } else if (Array.isArray(order.products) && order.products.length > 0) {
            // Legacy shape fallback: some older responses include products[] instead of items[]
            for (const productRef of order.products) {
              if (!belongsToMerchant(productRef)) continue

              hasMerchantProduct = true

              const quantity = 1
              const unitPrice =
                productRef && typeof productRef === "object"
                  ? toNumber(productRef.price, 0)
                  : 0
              const lineRevenue = quantity * unitPrice

              merchantOrderRevenue += lineRevenue

              const productId = extractId(productRef)
              const fallbackName =
                productRef && typeof productRef === "object" && typeof productRef.name === "string"
                  ? productRef.name
                  : ""

              updateProductStats(productId, fallbackName, quantity, lineRevenue)
            }
          }

          if (!hasMerchantProduct) continue

          totalOrders += 1
          totalRevenue += merchantOrderRevenue

          if (customerId) {
            uniqueCustomers.add(customerId)
          }

          if (monthKey) {
            const salesPoint = salesByKey.get(monthKey)
            if (salesPoint) {
              salesPoint.sales += merchantOrderRevenue
            }
          }

          if (monthKey === currentMonthKey) {
            currentMonthRevenue += merchantOrderRevenue
            currentMonthOrders += 1
            if (customerId) currentMonthCustomers.add(customerId)
          }

          if (monthKey === previousMonthKey) {
            previousMonthRevenue += merchantOrderRevenue
            previousMonthOrders += 1
            if (customerId) previousMonthCustomers.add(customerId)
          }
        }

        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        const currentMonthAvg = currentMonthOrders > 0 ? currentMonthRevenue / currentMonthOrders : 0
        const previousMonthAvg = previousMonthOrders > 0 ? previousMonthRevenue / previousMonthOrders : 0

        const topProducts = Array.from(productStats.values())
          .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
          .slice(0, 3)

        setAnalytics({
          totalRevenue,
          totalOrders,
          avgOrderValue,
          customers: uniqueCustomers.size,
          revenueChange: getPercentChange(currentMonthRevenue, previousMonthRevenue),
          ordersChange: getPercentChange(currentMonthOrders, previousMonthOrders),
          avgOrderChange: getPercentChange(currentMonthAvg, previousMonthAvg),
          customersChange: getPercentChange(currentMonthCustomers.size, previousMonthCustomers.size),
          salesData,
          topProducts,
        })
      } catch (err) {
        console.error("Failed to load analytics:", err)
        setError("Failed to load analytics")
        setAnalytics(emptyAnalytics())
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [user?.id, user?.name])

  const maxMonthlySales = useMemo(() => {
    return Math.max(...analytics.salesData.map((point) => point.sales), 1)
  }, [analytics.salesData])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: DollarSign,
            label: t("totalRevenue"),
            value: formatCurrency(analytics.totalRevenue),
            change: analytics.revenueChange,
          },
          {
            icon: ShoppingCart,
            label: t("totalOrders"),
            value: analytics.totalOrders.toLocaleString(),
            change: analytics.ordersChange,
          },
          {
            icon: TrendingUp,
            label: t("avgOrderValue"),
            value: formatCurrency(analytics.avgOrderValue),
            change: analytics.avgOrderChange,
          },
          {
            icon: Users,
            label: t("customers"),
            value: analytics.customers.toLocaleString(),
            change: analytics.customersChange,
          },
        ].map((stat, index) => {
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
              <p className={`text-sm ${stat.change.startsWith("-") ? "text-red-600" : "text-green-600"}`}>
                {stat.change} {t("fromLastMonth")}
              </p>
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
          <h2 className="text-xl font-serif mb-6">{t("salesOverview")}</h2>
          <div className="space-y-4">
            {analytics.salesData.map((data) => {
              const widthPercentage = (data.sales / maxMonthlySales) * 100
              return (
                <div key={data.month} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">{data.month}</span>
                  <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${widthPercentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      ${data.sales.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
          <h2 className="text-xl font-serif mb-6">{t("topProducts")}</h2>
          {analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={`${product.name}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.sales} {t("sales")}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${product.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{t("revenue")}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sales data yet.</p>
          )}
        </motion.div>
      </div>
    </div >
  )
}
