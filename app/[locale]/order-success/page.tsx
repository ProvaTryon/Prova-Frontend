"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Link } from "@/i18n/routing"
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import * as orderService from "@/lib/order-service"
import type { CreatedOrder } from "@/lib/order-service"
import { motion } from "framer-motion"

export default function OrderSuccessPage() {
    const t = useTranslations("orderSuccess")
    const tCart = useTranslations("cart")
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")

    const [order, setOrder] = useState<CreatedOrder | null>(null)
    const [loading, setLoading] = useState(!!orderId)

    useEffect(() => {
        if (!orderId) return
        orderService
            .getOrderById(orderId)
            .then((data) => setOrder(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [orderId])

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-lg mx-auto text-center px-4 py-16"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </motion.div>

                    <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        {t("description")}
                    </p>

                    {/* Order details card */}
                    {loading && (
                        <div className="flex justify-center mb-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {order && (
                        <div className="bg-card border border-border rounded-xl p-6 mb-8 text-start">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-muted-foreground" />
                                <h3 className="font-medium">{t("orderDetails")}</h3>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("orderId")}</span>
                                    <span className="font-mono text-xs no-flip">{order._id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("status")}</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 capitalize">
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tCart("subtotal")}</span>
                                    <span className="no-flip">${order.subtotal?.toFixed(2) ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tCart("shipping")}</span>
                                    <span className="no-flip">{order.shipping === 0 ? tCart("shippingFree") : `$${order.shipping?.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tCart("tax")}</span>
                                    <span className="no-flip">${order.tax?.toFixed(2) ?? "—"}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
                                    <span>{tCart("total")}</span>
                                    <span className="no-flip">${order.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && orderId && !order && (
                        <p className="text-sm text-muted-foreground mb-8">{t("orderIdLabel")}: <span className="font-mono no-flip">{orderId}</span></p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-all"
                        >
                            {t("continueShopping")}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/profile"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-border font-medium rounded-lg hover:bg-muted transition-colors"
                        >
                            {t("viewOrders")}
                        </Link>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}
