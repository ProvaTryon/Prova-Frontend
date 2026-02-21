"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/lib/auth-context"
import { Link } from "@/i18n/routing"
import { Loader2, Package } from "lucide-react"
import * as orderService from "@/lib/order-service"
import { motion, AnimatePresence } from "framer-motion"

interface Order {
    _id: string
    id?: string
    customerName: string
    email: string
    phone: string
    address: string
    items: Array<{
        productId: string
        quantity: number
        price: number
    }>
    totalAmount: number
    status: string
    createdAt: string
    updatedAt?: string
}

export default function OrdersPage() {
    const { user, isAuthenticated } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setLoading(false)
            return
        }

        const fetchOrders = async () => {
            try {
                setLoading(true)
                setError("")
                const data = await orderService.getUserOrders(user.id)
                setOrders(data)
            } catch (err) {
                console.error("Failed to fetch orders:", err)
                setError("Failed to load orders. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [user?.id, isAuthenticated])

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-16 px-4">
                        <h2 className="font-serif text-3xl font-medium mb-4">Sign In Required</h2>
                        <p className="text-muted-foreground mb-8">Please sign in to view your orders</p>
                        <Link
                            href="/login"
                            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "processing":
                return "bg-blue-100 text-blue-800"
            case "shipped":
                return "bg-purple-100 text-purple-800"
            case "delivered":
                return "bg-green-100 text-green-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-serif text-4xl font-medium mb-2"
                    >Your Orders</motion.h1>
                    <p className="text-muted-foreground mb-8">View and track your orders</p>

                    {error && (
                        <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 bg-muted/50 rounded-lg">
                            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-medium mb-2">No Orders Yet</h3>
                            <p className="text-muted-foreground mb-8">Start shopping to create your first order</p>
                            <Link
                                href="/shop"
                                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                            >
                                Shop Now
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order, index) => (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                    whileHover={{ y: -2 }}
                                >
                                <Link
                                    href={`/orders/${order._id}`}
                                    className="block bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""} · Ordered on{" "}
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Delivery to: {order.address}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</p>
                                            <span className="text-sm text-primary hover:underline">View Details →</span>
                                        </div>
                                    </div>
                                </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
