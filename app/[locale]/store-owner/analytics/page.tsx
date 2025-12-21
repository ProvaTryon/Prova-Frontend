"use client"

import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { mockStores } from "@/lib/mock-data"
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react"

export default function StoreOwnerAnalytics() {
  const t = useTranslations("storeOwner.analytics")
  const { user } = useAuth()
  const store = mockStores.find((s) => s.id === user?.storeId)

  const salesData = [
    { month: "Jan", sales: 4200 },
    { month: "Feb", sales: 5100 },
    { month: "Mar", sales: 4800 },
    { month: "Apr", sales: 6200 },
    { month: "May", sales: 7100 },
    { month: "Jun", sales: 8400 },
  ]

  const topProducts = [
    { name: "Silk Blend Midi Dress", sales: 45, revenue: 6705 },
    { name: "Tailored Wool Blazer", sales: 38, revenue: 11362 },
    { name: "Wide Leg Trousers", sales: 32, revenue: 4128 },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t("totalRevenue")}</span>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mb-2">${(store?.revenue || 0).toLocaleString()}</div>
          <p className="text-sm text-green-600">+12% {t("fromLastMonth")}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t("totalOrders")}</span>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mb-2">{store?.totalSales || 0}</div>
          <p className="text-sm text-green-600">+8% {t("fromLastMonth")}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t("avgOrderValue")}</span>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mb-2">
            ${store?.totalSales ? Math.round((store.revenue / store.totalSales) * 100) / 100 : 0}
          </div>
          <p className="text-sm text-green-600">+3% {t("fromLastMonth")}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t("customers")}</span>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mb-2">1,234</div>
          <p className="text-sm text-green-600">+15% {t("fromLastMonth")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-serif mb-6">{t("salesOverview")}</h2>
          <div className="space-y-4">
            {salesData.map((data, index) => {
              const widthPercentage = (data.sales / 10000) * 100
              return (
                <div key={data.month} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">{data.month}</span>
                  <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                    {/* Dynamic width based on sales data - inline style necessary for data visualization */}
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${widthPercentage}%` } as React.CSSProperties}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      ${data.sales.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-serif mb-6">{t("topProducts")}</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4 p-4 border rounded-lg">
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
        </div>
      </div>
    </div>
  )
}
