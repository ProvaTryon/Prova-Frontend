"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, X, Loader2, AlertCircle, Tag, Briefcase } from "lucide-react"
import * as productService from "@/lib/product-service"
import type { Product } from "@/lib/product-service"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Link from "next/link"

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const t = useTranslations('search')
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [initialLoading, setInitialLoading] = useState(true)

    // Get unique categories and brands from loaded products
    const allCategories = useMemo(() => [...new Set(allProducts.map(p => p.category).filter(Boolean))], [allProducts])
    const allBrands = useMemo(() => [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])], [allProducts])

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

    // Filter products based on search query (searches name, category, brand, description)
    const filteredResults = useMemo(() => {
        if (!query.trim()) return []

        const searchTerms = query.toLowerCase().trim().split(/\s+/)

        return allProducts.filter(product => {
            // Create searchable fields as separate items for word-boundary matching
            const searchableFields = [
                product.name?.toLowerCase() || '',
                product.category?.toLowerCase() || '',
                product.brand?.toLowerCase() || '',
                product.description?.toLowerCase() || '',
            ]

            // All search terms must match with word boundary logic
            return searchTerms.every(term => {
                return searchableFields.some(field => {
                    // Split field into words and check if any word starts with the search term
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
            // Match if category starts with query, or query matches the whole word
            return catLower.startsWith(q) || catLower === q
        })
    }, [query])

    const matchingBrands = useMemo(() => {
        if (!query.trim()) return []
        const q = query.toLowerCase().trim()
        return allBrands.filter(brand => {
            const brandLower = brand.toLowerCase()
            // Match if any word in brand starts with query
            const words = brandLower.split(/\s+/)
            return words.some(word => word.startsWith(q)) || brandLower.startsWith(q)
        })
    }, [query])

    // Save to recent searches when results are found
    useEffect(() => {
        if (query.trim() && filteredResults.length > 0) {
            const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5)
            setRecentSearches(updated)
            localStorage.setItem('recentSearches', JSON.stringify(updated))
        }
    }, [filteredResults.length, query])

    const handleSelectResult = (product: Product) => {
        onClose()
        router.push(`/product/${product.id}`)
    }

    const handleCategoryClick = (category: string) => {
        onClose()
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

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 top-0 z-50 mt-16 px-4 transition-all">
                <div className="max-w-3xl mx-auto bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
                    {/* Search Input */}
                    <div className="p-6 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={t('placeholder') || "Search products..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                                className="w-full pl-12 pr-10 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Container */}
                    <div className="max-h-[70vh] overflow-y-auto">
                        {/* Loading State */}
                        {initialLoading && (
                            <div className="p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">{t('searching') || "Loading products..."}</p>
                            </div>
                        )}

                        {/* Category & Brand Quick Filters */}
                        {query && !initialLoading && (matchingCategories.length > 0 || matchingBrands.length > 0) && (
                            <div className="p-4 border-b border-border">
                                {matchingCategories.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {t('categories') || "Categories"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {matchingCategories.map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => handleCategoryClick(category)}
                                                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-full transition-colors capitalize"
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {matchingBrands.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" />
                                            {t('brands') || "Brands"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {matchingBrands.map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => handleBrandClick(brand)}
                                                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-full transition-colors"
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Search Results */}
                        {query && filteredResults.length > 0 && !initialLoading && (
                            <div className="p-4">
                                <p className="text-xs font-medium text-muted-foreground mb-3 px-2">
                                    {filteredResults.length} {filteredResults.length === 1 ? t('result') : t('results') || "results"} {t('for')} "{query}"
                                </p>
                                <div className="space-y-2">
                                    {filteredResults.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelectResult(product)}
                                            className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors text-left group"
                                        >
                                            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={product.image || "/placeholder.svg"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate capitalize">{product.category}</p>
                                                {product.brand && (
                                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-semibold text-sm text-primary">${product.price}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {query && filteredResults.length === 0 && !initialLoading && (
                            <div className="p-8 text-center">
                                <p className="text-muted-foreground mb-4">{t('noResults') || "No products found"}</p>
                                <Link
                                    href="/shop"
                                    onClick={onClose}
                                    className="text-sm text-primary hover:underline"
                                >
                                    {t('browseAll') || "Browse all products"}
                                </Link>
                            </div>
                        )}

                        {/* Recent Searches */}
                        {!query && recentSearches.length > 0 && (
                            <div className="p-6 border-t border-border">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('recent') || "Recent Searches"}
                                    </p>
                                    <button
                                        onClick={handleClearRecent}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        {t('clear') || "Clear"}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((search) => (
                                        <button
                                            key={search}
                                            onClick={() => setQuery(search)}
                                            className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-sm rounded-full transition-colors"
                                        >
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!query && recentSearches.length === 0 && (
                            <div className="p-8 text-center">
                                <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                                <p className="text-muted-foreground">{t('startTyping') || "Start typing to search products"}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer - Search Suggestions */}
                    <div className="border-t border-border p-4 bg-muted/50 text-center">
                        <p className="text-xs text-muted-foreground">
                            {t('tip') || "💡 Tip: Search by product name, category, or brand"}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
