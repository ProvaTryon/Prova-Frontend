"use client"

import { useState, useRef } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import * as orderService from "@/lib/order-service"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

/* ── Constants (must match cart page) ── */
const TAX_RATE = 0.08
const FREE_SHIPPING_THRESHOLD = 100
const SHIPPING_COST = 10

export default function CheckoutPage() {
    const router = useRouter()
    const t = useTranslations("checkout")
    const tCart = useTranslations("cart")
    const { items, totalPrice, clearCart } = useCart()
    const { user, isAuthenticated } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const submitting = useRef(false)  // double-click guard

    // Form state — pre-filled from user context
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: "",
        zipCode: "",
        country: "",
    })

    // ── Price calculations (same as cart) ──
    const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const tax = +(totalPrice * TAX_RATE).toFixed(2)
    const total = +(totalPrice + shipping + tax).toFixed(2)

    // ── Redirect: not authenticated ──
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-16 px-4">
                        <h2 className="font-serif text-3xl font-medium mb-4">{t("signInRequired")}</h2>
                        <p className="text-muted-foreground mb-8">{t("signInDescription")}</p>
                        <Link
                            href="/auth"
                            className="inline-block px-8 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-all"
                        >
                            {t("signIn")}
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // ── Redirect: empty cart ──
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-16 px-4">
                        <h2 className="font-serif text-3xl font-medium mb-4">{tCart("empty")}</h2>
                        <p className="text-muted-foreground mb-8">{t("addItemsFirst")}</p>
                        <Link
                            href="/shop"
                            className="inline-block px-8 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-all"
                        >
                            {tCart("continueShopping")}
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submitting.current) return
        submitting.current = true
        setError("")
        setLoading(true)

        try {
            // Client-side validation
            if (!formData.fullName || !formData.phone || !formData.address) {
                throw new Error(t("fillRequired"))
            }

            // Build order payload (userId comes from JWT on backend)
            const orderPayload: orderService.CheckoutOrderPayload = {
                items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.salePrice || item.price,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                })),
                address: [formData.address, formData.city, formData.zipCode, formData.country]
                    .filter(Boolean)
                    .join(", "),
                paymentMethod: "cod",
            }

            const result = await orderService.createOrder(orderPayload)

            // Success!
            clearCart()
            toast({ title: t("orderPlaced"), description: t("orderPlacedDescription") })
            router.push(`/order-success?orderId=${result._id}`)
        } catch (err) {
            const msg = (err as Error).message || t("genericError")
            setError(msg)
            toast({ title: t("orderFailed"), description: msg, variant: "destructive" })
        } finally {
            setLoading(false)
            submitting.current = false
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t("backToCart")}
                    </Link>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* ── Checkout Form ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h2 className="font-serif text-2xl font-medium mb-6">{t("title")}</h2>

                            {error && (
                                <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Shipping Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">{t("shippingInfo")}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">{t("fullName")} *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("email")}</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("phone")} *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">{t("address")} *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("city")}</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("zipCode")}</label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("country")}</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment — COD only for now */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium mb-4">{t("paymentMethod")}</h3>
                                    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/30">
                                        <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{t("cashOnDelivery")}</p>
                                            <p className="text-xs text-muted-foreground">{t("codDescription")}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-foreground text-background font-medium hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t("processing")}
                                        </>
                                    ) : (
                                        <>{t("placeOrder")} — <span className="no-flip">${total.toFixed(2)}</span></>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        {/* ── Order Summary ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h2 className="font-serif text-2xl font-medium mb-6">{tCart("orderSummary")}</h2>

                            <div className="bg-muted/50 p-6 rounded-xl sticky top-8 shadow-sm">
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
                                            <div className="w-16 h-20 bg-muted flex-shrink-0 relative overflow-hidden rounded-lg">
                                                {item.image && (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate no-flip">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground no-flip">
                                                    {item.quantity} × ${(item.salePrice || item.price).toFixed(2)}
                                                </p>
                                                {item.selectedSize && (
                                                    <p className="text-xs text-muted-foreground">{tCart("size")}: <span className="no-flip">{item.selectedSize}</span></p>
                                                )}
                                                {item.selectedColor && (
                                                    <p className="text-xs text-muted-foreground">{tCart("color")}: <span className="no-flip">{item.selectedColor}</span></p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-medium text-sm no-flip">${((item.salePrice || item.price) * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-border space-y-3 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{tCart("subtotal")}</span>
                                        <span className="no-flip">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{tCart("shipping")}</span>
                                        <span className="no-flip">{shipping === 0 ? tCart("shippingFree") : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{tCart("tax")}</span>
                                        <span className="no-flip">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
                                        <span>{tCart("total")}</span>
                                        <span className="no-flip">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
