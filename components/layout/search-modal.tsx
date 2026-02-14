"use client"

import { useState, useEffect, useMemo, useRef, useCallback, Fragment } from "react"
import { Search, X, Loader2, TrendingUp, ArrowRight } from "lucide-react"
import * as productService from "@/lib/product-service"
import type { Product } from "@/lib/product-service"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Link from "next/link"

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

/* ── Highlight matched text with camel accent ── */
function HighlightMatch({ text, query }: { text: string; query: string }) {
    if (!query.trim() || !text) return <>{text}</>
    const terms = query.trim().split(/\s+/).filter(Boolean)
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = text.split(pattern)
    return (
        <>
            {parts.map((part, i) =>
                pattern.test(part)
                    ? <mark key={i} className="bg-transparent text-accent font-semibold">{part}</mark>
                    : <Fragment key={i}>{part}</Fragment>
            )}
        </>
    )
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const t = useTranslations('search')
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState("")
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [error, setError] = useState("")
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [visible, setVisible] = useState(false)

    // Get unique categories and brands from loaded products
    const allCategories = useMemo(() => [...new Set(allProducts.map(p => p.category).filter(Boolean))], [allProducts])
    const allBrands = useMemo(() => [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])], [allProducts])

    /* ── Animate in ── */
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true))
            document.body.style.overflow = 'hidden'
        } else {
            setVisible(false)
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    /* ── Close with animation ── */
    const handleClose = useCallback(() => {
        setVisible(false)
        setTimeout(onClose, 250)
    }, [onClose])

    /* ── Escape key ── */
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
        if (isOpen) window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isOpen, handleClose])

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches')
        if (stored) {
            setRecentSearches(JSON.parse(stored))
        }
    }, [])

    // Load all products from backend when modal opens
    useEffect(() => {
        if (!isOpen) return

        const loadAllProducts = async () => {
            try {
                setInitialLoading(true)
                setError("")

                const backendData = await productService.getAllProducts()
                const backendProducts = Array.isArray(backendData) ? backendData : []
                setAllProducts(backendProducts)
            } catch (err) {
                console.error("Failed to load products:", err)
                setError(t('searchError') || "Failed to load products")
                setAllProducts([])
            } finally {
                setInitialLoading(false)
            }
        }

        loadAllProducts()
    }, [isOpen, t])

    // Filter products based on search query
    const filteredResults = useMemo(() => {
        if (!query.trim()) return []

        const searchTerms = query.toLowerCase().trim().split(/\s+/)

        return allProducts.filter(product => {
            const searchableFields = [
                product.name?.toLowerCase() || '',
                product.category?.toLowerCase() || '',
                product.brand?.toLowerCase() || '',
                product.description?.toLowerCase() || '',
            ]

            return searchTerms.every(term => {
                return searchableFields.some(field => {
                    const words = field.split(/\s+/)
                    return words.some(word => word.startsWith(term)) || field.startsWith(term)
                })
            })
        })
    }, [query, allProducts])

    // Get category and brand matches for quick filters
    const matchingCategories = useMemo(() => {
        if (!query.trim()) return []
        const q = query.toLowerCase().trim()
        return allCategories.filter(cat => {
            const catLower = cat.toLowerCase()
            return catLower.startsWith(q) || catLower === q
        })
    }, [query, allCategories])

    const matchingBrands = useMemo(() => {
        if (!query.trim()) return []
        const q = query.toLowerCase().trim()
        return allBrands.filter(brand => {
            const brandLower = brand.toLowerCase()
            const words = brandLower.split(/\s+/)
            return words.some(word => word.startsWith(q)) || brandLower.startsWith(q)
        })
    }, [query, allBrands])

    // Save to recent searches when results are found
    useEffect(() => {
        if (query.trim() && filteredResults.length > 0) {
            const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5)
            setRecentSearches(updated)
            localStorage.setItem('recentSearches', JSON.stringify(updated))
        }
    }, [filteredResults.length, query])

    const handleSelectResult = (product: Product) => {
        handleClose()
        router.push(`/product/${product.id}`)
    }

    const handleCategoryClick = (category: string) => {
        handleClose()
        router.push(`/shop?category=${encodeURIComponent(category)}`)
    }

    const handleBrandClick = (brand: string) => {
        setQuery(brand)
    }

    const handleClearRecent = () => {
        setRecentSearches([])
        localStorage.removeItem('recentSearches')
    }

    if (!isOpen) return null

    const hasQuickFilters = matchingCategories.length > 0 || matchingBrands.length > 0

    return (
        <>
            {/* Backdrop — dark blurred overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Modal — centered with depth */}
            <div className={`fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[8vh] md:pt-[12vh] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="w-full max-w-2xl bg-background/98 backdrop-blur-xl rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)] border border-border/50 overflow-hidden">

                    {/* ── Search Input ── */}
                    <div className="relative px-6 pt-6 pb-5">
                        <div className="relative group/input">
                            <Search className="absolute start-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 transition-colors group-focus-within/input:text-accent" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={t('placeholder') || "Search products, brands, or categories..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                                className="w-full ps-8 pe-10 py-3 bg-transparent border-0 border-b-2 border-border/60 rounded-none text-lg font-light tracking-wide placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors duration-300"
                            />
                            {query ? (
                                <button
                                    onClick={() => { setQuery(""); inputRef.current?.focus() }}
                                    className="absolute end-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-accent rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : (
                                <kbd className="absolute end-0 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50 border border-border/50 rounded">
                                    ESC
                                </kbd>
                            )}
                        </div>
                    </div>

                    {/* ── Results Container ── */}
                    <div className="max-h-[60vh] overflow-y-auto overscroll-contain">

                        {/* Loading State */}
                        {initialLoading && (
                            <div className="py-16 text-center">
                                <div className="inline-flex items-center gap-3 text-muted-foreground/60">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm tracking-wide">{t('searching') || "Loading products..."}</span>
                                </div>
                            </div>
                        )}

                        {/* Quick Filters — Categories & Brands as pills */}
                        {query && !initialLoading && hasQuickFilters && (
                            <div className="px-6 pb-4 space-y-3">
                                {matchingBrands.length > 0 && (
                                    <div>
                                        <p className="text-overline text-muted-foreground/50 mb-2">
                                            {t('brands') || "Brands"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {matchingBrands.map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => handleBrandClick(brand)}
                                                    className="px-4 py-1.5 text-xs font-medium tracking-wide border border-border/60 rounded-full hover:border-accent hover:text-accent transition-all duration-200"
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {matchingCategories.length > 0 && (
                                    <div>
                                        <p className="text-overline text-muted-foreground/50 mb-2">
                                            {t('categories') || "Categories"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {matchingCategories.map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => handleCategoryClick(category)}
                                                    className="px-4 py-1.5 text-xs font-medium tracking-wide border border-border/60 rounded-full capitalize hover:border-accent hover:text-accent transition-all duration-200"
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="border-b border-border/30" />
                            </div>
                        )}

                        {/* ── Search Results — 2-column grid on desktop ── */}
                        {query && filteredResults.length > 0 && !initialLoading && (
                            <div className="px-6 pb-6">
                                <p className="text-overline text-muted-foreground/50 mb-4">
                                    {filteredResults.length} {filteredResults.length === 1 ? t('result') : t('results') || "results"} {t('for')} &ldquo;{query}&rdquo;
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredResults.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelectResult(product)}
                                            className="flex items-center gap-4 p-3 rounded-xl text-start group/card hover:bg-muted/50 transition-all duration-200"
                                        >
                                            {/* Product image with hover zoom */}
                                            <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={product.image || "/placeholder.svg"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.06]"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <p className="text-sm font-medium leading-snug line-clamp-1 group-hover/card:text-accent transition-colors duration-200">
                                                    <HighlightMatch text={product.name} query={query} />
                                                </p>
                                                <p className="text-[11px] tracking-wide capitalize text-muted-foreground/60">
                                                    <HighlightMatch text={product.category || ''} query={query} />
                                                </p>
                                                {product.brand && (
                                                    <p className="text-[11px] text-muted-foreground/40">
                                                        <HighlightMatch text={product.brand} query={query} />
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 text-end">
                                                {product.salePrice ? (
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-semibold tabular-nums">${product.salePrice}</p>
                                                        <p className="text-[11px] text-muted-foreground/40 line-through tabular-nums">${product.price}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-semibold tabular-nums">${product.price}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {query && filteredResults.length === 0 && !initialLoading && (
                            <div className="py-16 text-center px-6">
                                <p className="text-muted-foreground/60 mb-1 text-sm">{t('noResults') || "No products found"}</p>
                                <Link
                                    href="/shop"
                                    onClick={handleClose}
                                    className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4 mt-3 transition-colors"
                                >
                                    {t('browseAll') || "Browse all products"}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}

                        {/* ── Idle state: Recent + Trending ── */}
                        {!query && !initialLoading && (
                            <div className="px-6 pb-6 space-y-6">
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-overline text-muted-foreground/50">
                                                {t('recent') || "Recent Searches"}
                                            </p>
                                            <button
                                                onClick={handleClearRecent}
                                                className="text-[11px] tracking-wide text-muted-foreground/40 hover:text-accent transition-colors"
                                            >
                                                {t('clear') || "Clear"}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map((search) => (
                                                <button
                                                    key={search}
                                                    onClick={() => setQuery(search)}
                                                    className="px-4 py-1.5 text-xs font-medium tracking-wide border border-border/60 rounded-full hover:border-accent hover:text-accent transition-all duration-200"
                                                >
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Trending / Popular categories */}
                                {allCategories.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <TrendingUp className="w-3.5 h-3.5 text-accent/70" />
                                            <p className="text-overline text-muted-foreground/50">Trending</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {allCategories.slice(0, 6).map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => handleCategoryClick(category)}
                                                    className="px-4 py-1.5 text-xs font-medium tracking-wide bg-muted/50 rounded-full capitalize hover:bg-accent/10 hover:text-accent transition-all duration-200"
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty — no recent, no categories yet */}
                                {recentSearches.length === 0 && allCategories.length === 0 && (
                                    <div className="py-10 text-center">
                                        <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                                        <p className="text-sm text-muted-foreground/50">{t('startTyping') || "Start typing to search products"}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="border-t border-border/30 px-6 py-3 flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground/40 tracking-wide">
                            {t('tip') || "Search by product name, category, or brand"}
                        </p>
                        <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground/30">
                            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 border border-border/40 rounded text-[10px]">↵</kbd> select</span>
                            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 border border-border/40 rounded text-[10px]">esc</kbd> close</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
