"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Package, Users, TrendingUp, Store, Loader2 } from "lucide-react"
import * as merchantService from "@/lib/merchant-service"
import * as userService from "@/lib/user-service"
import * as productService from "@/lib/product-service"
import * as orderService from "@/lib/order-service"
import { motion } from "framer-motion"

// Backend data structures
interface Merchant {
  _id: string
  name: string
  email: string
  companyName: string
  products: string[]
  createdAt?: string
}

interface Order {
  _id: string
  user: any
  products: any[]
  total: number
  status: string
  address: string
  paymentMethod: string
  createdAt?: string
}

export default function AdminDashboard() {
  const t = useTranslations('admin.dashboard')
  const tStats = useTranslations('admin.dashboard.stats')

  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [merchantsData, usersData, productsData, ordersData] = await Promise.allSettled([
          merchantService.getAllMerchants(),
          userService.getAllUsers(),
          productService.getAllProducts(),
          orderService.getAllOrders(),
        ])

        console.log("Dashboard data loaded:", { merchantsData, usersData, productsData, ordersData })

        if (merchantsData.status === 'fulfilled') {
          setMerchants(merchantsData.value || [])
        }
        if (usersData.status === 'fulfilled') {
          setUsers(usersData.value || [])
        }
        if (productsData.status === 'fulfilled') {
          setProducts(productsData.value || [])
        }
        if (ordersData.status === 'fulfilled') {
          setOrders(ordersData.value || [])
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const totalStores = merchants.length

  // Calculate total revenue from orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

  const stats = [
    {
      name: tStats('totalStores'),
      value: totalStores.toString(),
      change: `${merchants.length} merchants`,
      icon: Store,
      color: "text-accent-foreground",
      bgColor: "bg-accent/20",
    },
    {
      name: tStats('totalProducts'),
      value: products.length.toString(),
      change: "From database",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: tStats('totalUsers'),
      value: users.length.toString(),
      change: "Registered users",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: tStats('revenue'),
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${orders.length} orders`,
      icon: TrendingUp,
      color: "text-primary-foreground",
      bgColor: "bg-primary/20",
    },
  ]

  // Get recent orders (last 4)
  const recentOrders = orders.slice(0, 4)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('welcome')}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-background border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-background border border-border rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-serif text-xl font-semibold mb-4">Recent Merchants</h2>
          <div className="space-y-4">
            {merchants.length > 0 ? (
              merchants.slice(0, 5).map((merchant) => (
                <div
                  key={merchant._id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{merchant.companyName || merchant.name}</p>
                    <p className="text-sm text-muted-foreground">{merchant.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {merchant.products?.length || 0} products
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No merchants found</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-background border border-border rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-serif text-xl font-semibold mb-4">{t('recentOrders')}</h2>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.products?.length || 0} products • ${order.total?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-50 text-purple-700' :
                            'bg-gray-50 text-gray-700'
                    }`}>
                    {order.status || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
