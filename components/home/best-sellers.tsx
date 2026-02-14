"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Image from "next/image"
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

    const SectionHeader = () => (
        <div className="text-center mb-16">
            <p className="text-overline text-muted-foreground mb-4">{t('bestSellers.overline')}</p>
            <h2 className="text-headline">{t('bestSellers.title')}</h2>
            <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
        </div>
    )

    if (loading) {
        return (
            <section className="py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader />
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                </div>
            </section>
        )
    }

    if (products.length === 0) {
        return (
            <section className="py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader />
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        {t('bestSellers.empty')}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-24 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader />

                {/* 4-column editorial grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="group"
                        >
                            <div className="relative mb-4 overflow-hidden bg-muted aspect-[3/4]">
                                {product.salePrice && (
                                    <span className="absolute top-3 start-3 bg-foreground text-background text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1 z-10">
                                        {tProduct('sale')}
                                    </span>
                                )}
                                <Image
                                    src={product.image || product.images?.[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-[1.04] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>
                            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5 no-flip">
                                {product.brand || "Fashion Brand"}
                            </p>
                            <h3 className="font-medium text-sm mb-2 line-clamp-1 no-flip group-hover:text-accent transition-colors duration-200">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                {product.salePrice ? (
                                    <>
                                        <span className="text-sm font-semibold tabular-nums no-flip">${product.salePrice}</span>
                                        <span className="text-muted-foreground line-through text-xs tabular-nums no-flip">${product.price}</span>
                                    </>
                                ) : (
                                    <span className="text-sm font-semibold tabular-nums no-flip">${product.price}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All link */}
                <div className="text-center mt-14">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300"
                    >
                        {t('viewAll')}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
