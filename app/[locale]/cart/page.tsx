"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function CartPage() {
  const t = useTranslations('cart')
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-3xl font-medium mb-4">{t('empty')}</h2>
            <p className="text-muted-foreground mb-8">{t('emptySubtitle')}</p>
            <Link
              href="/shop"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-4xl font-medium">{t('title')}</h1>
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('clearAll')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                >
                  <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground no-flip">{item.brand}</p>
                          <h3 className="font-medium no-flip">{item.name}</h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                          className="p-2 hover:bg-muted rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{t('size')}: <span className="no-flip">{item.selectedSize}</span></p>
                        <p>{t('color')}: <span className="no-flip">{item.selectedColor}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)
                          }
                          className="p-2 hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-sm font-medium no-flip">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)
                          }
                          className="p-2 hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold no-flip">${((item.salePrice || item.price) * item.quantity).toFixed(2)}</p>
                        {item.salePrice && (
                          <p className="text-xs text-muted-foreground line-through no-flip">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 bg-card rounded-lg border border-border space-y-4">
                <h2 className="font-serif text-2xl font-medium">{t('orderSummary')}</h2>

                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span className="font-medium no-flip">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('shipping')}</span>
                    <span className="font-medium no-flip">{totalPrice > 100 ? t('shippingFree') : "$10.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('tax')}</span>
                    <span className="font-medium no-flip">${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('total')}</span>
                  <span className="no-flip">${(totalPrice + (totalPrice > 100 ? 0 : 10) + totalPrice * 0.08).toFixed(2)}</span>
                </div>

                <button className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">
                  {t('checkout')}
                </button>

                <Link
                  href="/shop"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('continueShopping')}
                </Link>

                {totalPrice < 100 && (
                  <div className="p-4 bg-muted rounded-lg text-sm text-center">
                    <p className="text-muted-foreground">
                      {t('freeShippingMessage').split('{amount}')[0]}
                      <span className="font-semibold text-foreground no-flip">${(100 - totalPrice).toFixed(2)}</span>
                      {t('freeShippingMessage').split('{amount}')[1]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
