"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Search, Eye, Package, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { OrderDetailsModal } from "@/components/admin/order-details-modal"
import * as orderService from "@/lib/order-service"
import { motion } from "framer-motion"

// Backend Order structure
interface Order {
    _id: string
    user: {
        _id: string
        name: string
        email: string
    } | string
    products: Array<{
        _id: string
        name: string
        price: number
        images?: string[]
    } | string>
    total: number
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
    address: string
    paymentMethod: string
    createdAt?: string
}

const statusColors = {
    pending: "bg-yellow-50 text-yellow-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
}

export default function MerchantOrdersPage() {
    const t = useTranslations('storeOwner.orders')
    const [orders, setOrders] = useState<Order[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await orderService.getAllOrders()
            console.log("Merchant orders loaded:", data)
            setOrders(data || [])
        } catch (error: any) {
            console.error("Failed to load orders:", error)
            setError(error.message || "Failed to load orders")
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    // Helper to get user info
    const getUserName = (order: Order) => {
        if (typeof order.user === 'object' && order.user?.name) {
            return order.user.name
        }
        return "Unknown"
    }

    const getUserEmail = (order: Order) => {
        if (typeof order.user === 'object' && order.user?.email) {
            return order.user.email
        }
        return ""
    }

    const filteredOrders = orders.filter(
        (order) =>
            order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getUserName(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
            getUserEmail(order).toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
        try {
            setActionLoading(orderId)
            // Find the current order to pass its data for validation
            const currentOrder = orders.find(o => o._id === orderId)
            await orderService.changeOrderStatus(orderId, { status: newStatus }, currentOrder)
            setOrders(orders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)))
        } catch (error: any) {
            console.error("Failed to update order status:", error)
            alert(error.message || "Failed to update order status")
            // Reload orders to get the current state from database
            loadOrders()
        } finally {
            setActionLoading(null)
        }
    }

    const handleViewOrder = (order: Order) => {
        // Transform order for the modal
        const modalOrder = {
            id: order._id,
            orderNumber: `ORD-${order._id.slice(-6).toUpperCase()}`,
            customerName: getUserName(order),
            customerEmail: getUserEmail(order),
            items: order.products?.map((product, index) => {
                if (typeof product === 'object') {
                    return {
                        productId: product._id,
                        productName: product.name,
                        quantity: 1,
                        price: product.price,
                        size: "N/A",
                        color: "N/A",
                    }
                }
                return {
                    productId: product,
                    productName: `Product ${index + 1}`,
                    quantity: 1,
                    price: 0,
                    size: "N/A",
                    color: "N/A",
                }
            }) || [],
            total: order.total,
            status: order.status,
            paymentStatus: "paid",
            orderDate: order.createdAt || new Date().toISOString(),
            shippingAddress: order.address || "N/A",
        }
        setSelectedOrder(modalOrder)
        setIsModalOpen(true)
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const shippedOrders = orders.filter((o) => o.status === "shipped").length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={loadOrders}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    {t('tryAgain')}
                </button>
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
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('totalOrders'), value: orders.length },
                  { label: t('totalRevenue'), value: `$${totalRevenue.toFixed(2)}` },
                  { label: t('pending'), value: pendingOrders },
                  { label: t('shipped'), value: shippedOrders },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -2 }}
                    className="bg-background border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-background border border-border rounded-xl shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold">{t('order')}</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold">{t('customer')}</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold">{t('items')}</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold">{t('total')}</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold">{t('date')}</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold">{t('status')}</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                <Package className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">ORD-{order._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-sm text-muted-foreground">{order.paymentMethod || "N/A"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{getUserName(order)}</p>
                                            <p className="text-sm text-muted-foreground">{getUserEmail(order)}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{order.products?.length || 0} {t('itemsCount')}</td>
                                    <td className="px-6 py-4 font-medium">${(order.total || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value as Order["status"])}
                                            className={`px-2 py-1 text-xs font-medium rounded capitalize ${statusColors[order.status] || "bg-gray-50 text-gray-700"} disabled:opacity-50`}
                                            aria-label={t('status')}
                                            disabled={actionLoading === order._id}
                                        >
                                            <option value="pending">{t('pending')}</option>
                                            <option value="processing">{t('processing')}</option>
                                            <option value="shipped">{t('shipped')}</option>
                                            <option value="delivered">{t('delivered')}</option>
                                            <option value="cancelled">{t('cancelled')}</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewOrder(order)}
                                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                title={t('viewOrder')}
                                                disabled={actionLoading === order._id}
                                            >
                                                {actionLoading === order._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('noOrdersFound')}</p>
                    </div>
                )}
            </motion.div>

            {/* Order Details Modal */}
            <OrderDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
        </div>
    )
}
