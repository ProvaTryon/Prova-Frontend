"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Loader2, ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/routing"
import * as orderService from "@/lib/order-service"

export default function CheckoutPage() {
    const router = useRouter()
    const { items, totalPrice, clearCart } = useCart()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form state
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: "",
        zipCode: "",
        country: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    })

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-16 px-4">
                        <h2 className="font-serif text-3xl font-medium mb-4">Sign In Required</h2>
                        <p className="text-muted-foreground mb-8">Please sign in to proceed with checkout</p>
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

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-16 px-4">
                        <h2 className="font-serif text-3xl font-medium mb-4">Your Cart is Empty</h2>
                        <p className="text-muted-foreground mb-8">Add items before checking out</p>
                        <Link
                            href="/shop"
                            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validate form
            if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
                throw new Error("Please fill in all required fields")
            }

            if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
                throw new Error("Please fill in all payment details")
            }

            // Create order
            const orderData = {
                customerName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zipCode: formData.zipCode,
                country: formData.country,
                items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                })),
                totalAmount: totalPrice,
                status: "pending",
                paymentMethod: "card",
            }

            const result = await orderService.createOrder(orderData)

            // Clear cart and redirect
            clearCart()
            router.push(`/orders/${result._id}?success=true`)
        } catch (err) {
            console.error("Checkout error:", err)
            setError((err as Error).message || "Failed to process order. Please try again.")
        } finally {
            setLoading(false)
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
                        className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Cart
                    </Link>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Checkout Form */}
                        <div>
                            <h2 className="font-serif text-2xl font-medium mb-6">Checkout</h2>

                            {error && (
                                <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Shipping Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Phone *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Address *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="123 Main Street"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="New York"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="10001"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="United States"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Card Number *</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">CVV *</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="123"
                                                    maxLength={3}
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Place Order - $${totalPrice.toFixed(2)}`
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <h2 className="font-serif text-2xl font-medium mb-6">Order Summary</h2>

                            <div className="bg-muted/50 rounded-lg p-6 sticky top-8">
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-4 pb-4 border-b">
                                            <div className="w-20 h-20 bg-muted rounded flex-shrink-0">
                                                {item.image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                                {item.selectedSize && (
                                                    <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                                                )}
                                                {item.selectedColor && (
                                                    <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                                                )}
                                            </div>
                                            <div className="text-right font-medium">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t space-y-3 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>${(totalPrice * 0.1).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-lg font-medium">
                                        <span>Total</span>
                                        <span>${(totalPrice * 1.1).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
