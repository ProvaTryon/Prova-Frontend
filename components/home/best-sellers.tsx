"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import * as productService from "@/lib/product-service"
import type { Product } from "@/lib/product-service"

export function BestSellers() {
    const t = useTranslations('home')
    const tProduct = useTranslations('product')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                const data = await productService.getAllProducts()
                if (data && Array.isArray(data)) {
                    // Get first 8 products as best sellers
                    setProducts(data.slice(0, 8))
                }
            } catch (err) {
                console.error("Failed to fetch products:", err)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return (
            <section className="py-16 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-serif font-medium">{t('bestSellers')}</h2>
                        <Link href="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
                            {t('viewAll')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                </div>
            </section>
        )
    }

    if (products.length === 0) {
        return (
            <section className="py-16 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-serif font-medium">{t('bestSellers')}</h2>
                        <Link href="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
                            {t('viewAll')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="text-center py-12 text-muted-foreground">
                        {t('noProducts') || "No products available"}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif font-medium">{t('bestSellers')}</h2>
                    <Link href="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
                        {t('viewAll')}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className="flex-none w-64 snap-start group"
                            >
                                <div className="relative mb-4 overflow-hidden rounded-lg bg-muted">
                                    {product.salePrice && (
                                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded z-10">
                                            {tProduct('sale')}
                                        </span>
                                    )}
                                    <img
                                        src={product.image || product.images?.[0] || "/placeholder.svg"}
                                        alt={product.name}
                                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="font-medium text-sm mb-1 line-clamp-2 no-flip">{product.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2 no-flip">{product.brand || "Fashion Brand"}</p>
                                <div className="flex items-center gap-2">
                                    {product.salePrice ? (
                                        <>
                                            <span className="text-red-600 font-semibold no-flip">${product.salePrice}</span>
                                            <span className="text-muted-foreground line-through text-sm no-flip">${product.price}</span>
                                        </>
                                    ) : (
                                        <span className="font-semibold no-flip">${product.price}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
