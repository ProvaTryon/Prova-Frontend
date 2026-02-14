"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { SlidersHorizontal, Search, Loader2, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import * as productService from "@/lib/product-service"
import type { Product } from "@/lib/product-service"

export default function ShopPage() {
  const t = useTranslations('shop')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [filters, setFilters] = useState({
    category: "all",
    brands: [] as string[],
    priceRange: [0, 5000] as [number, number],
    sizes: [] as string[],
  })

  // Fetch products from backend only
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await productService.getAllProducts()

        if (data && Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error("Failed to fetch products from backend:", err)
        setError(t('fetchError') || "Failed to load products. Please try again.")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [t])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category)
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => p.brand && filters.brands.includes(p.brand))
    }

    // Price filter
    filtered = filtered.filter((p) => {
      return p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    })

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((p) => p.sizes && p.sizes.some((size) => filters.sizes.includes(size)))
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    const sorted = [...filtered]
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        break
    }

    return sorted
  }, [products, filters, searchQuery, sortBy])

  // Derive unique brands from loaded products
  const availableBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean) as string[]
    return [...new Set(brands)].sort()
  }, [products])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-display mb-3">{t('title')}</h1>
            <p className="text-body-lg text-muted-foreground">{t('subtitle')}</p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
              aria-label={t('sortBy')}
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="price-low">{t('sortPriceLow')}</option>
              <option value="price-high">{t('sortPriceHigh')}</option>
              <option value="newest">{t('sortNewest')}</option>
              <option value="rating">{t('sortRating')}</option>
            </select>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 border border-border hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {t('filters')}
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <FilterSidebar
                isOpen={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
                onFilterChange={setFilters}
                availableBrands={availableBrands}
              />

              {/* Products Grid */}
              <div className="flex-1">
                <div className="mb-6 text-overline text-muted-foreground">
                  {filteredProducts.length} products
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product: any) => (
                      <ProductCard key={product._id || product.id} product={{
                        id: product._id || product.id || "",
                        name: product.name,
                        brand: product.brand || "Fashion Brand",
                        price: product.price,
                        category: product.category,
                        sizes: product.sizes || [],
                        colors: product.colors || [],
                        image: product.image || "",
                        images: product.images || [product.image],
                        description: product.description || "",
                        inStock: product.inStock !== false,
                      }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">{t('noResults')}</p>
                    <button
                      onClick={() =>
                        setFilters({
                          category: "all",
                          brands: [],
                          priceRange: [0, 5000],
                          sizes: [],
                        })
                      }
                      className="text-primary hover:underline"
                    >
                      {t('clearFilters')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
