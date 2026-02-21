"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import * as orderService from "@/lib/order-service"
import { motion } from "framer-motion"

interface Order {
    _id: string
    customerName: string
    email: string
    phone: string
    address: string
    city?: string
    zipCode?: string
    country?: string
    items: Array<{
        productId: string
        quantity: number
        price: number
        selectedSize?: string
        selectedColor?: string
    }>
    totalAmount: number
    status: string
    createdAt: string
    updatedAt?: string
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const searchParams = useSearchParams()
    const isSuccess = searchParams.get("success") === "true"

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { id } = await params
                setLoading(true)
                setError("")
                const data = await orderService.getOrderById(id)
                setOrder(data)
            } catch (err) {
                console.error("Failed to fetch order:", err)
                setError("Failed to load order. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [params])

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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link href="/orders" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>

                    {isSuccess && (
                        <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            <span>Order placed successfully! Thank you for your purchase.</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : !order ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">Order not found</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Order Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-background border border-border rounded-xl p-6 shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h1 className="font-serif text-3xl font-medium mb-2">
                                            Order #{order._id.slice(-8).toUpperCase()}
                                        </h1>
                                        <p className="text-muted-foreground">
                                            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </motion.div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Order Items */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                                    <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium">Product #{index + 1}</span>
                                                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>Quantity: {item.quantity}</p>
                                                    <p>Unit Price: ${item.price.toFixed(2)}</p>
                                                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                                                    {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping & Summary */}
                                <div className="space-y-6">
                                    {/* Shipping Address */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="bg-background border border-border rounded-xl p-6 shadow-sm"
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="font-medium">{order.customerName}</p>
                                            <p>{order.address}</p>
                                            {order.city && <p>{order.city}, {order.zipCode}</p>}
                                            {order.country && <p>{order.country}</p>}
                                            <p className="mt-3 text-muted-foreground">
                                                Phone: {order.phone}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Email: {order.email}
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Order Summary */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="bg-background border border-border rounded-xl p-6 shadow-sm"
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>${order.totalAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span>Free</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tax (10%)</span>
                                                <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                                                <span>Total</span>
                                                <span>${(order.totalAmount * 1.1).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Continue Shopping Button */}
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/shop"
                                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                                >
                                    Continue Shopping
                                </Link>
                                <Link
                                    href="/orders"
                                    className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-all"
                                >
                                    View All Orders
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
