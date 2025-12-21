"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { mockProducts } from "@/lib/mock-data"
import { SlidersHorizontal, Search } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ShopPage() {
  const t = useTranslations('shop')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [filters, setFilters] = useState({
    category: "all",
    brands: [] as string[],
    priceRange: [0, 500] as [number, number],
    sizes: [] as string[],
  })

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category)
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand))
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const price = p.salePrice || p.price
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((p) => p.sizes.some((size) => filters.sizes.includes(size)))
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case "price-high":
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [filters, searchQuery, sortBy])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
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
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('sortBy')}
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="price-low">{t('sortPriceLow')}</option>
              <option value="price-high">{t('sortPriceHigh')}</option>
              <option value="name">{t('sortName')}</option>
            </select>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {t('filters')}
            </button>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <FilterSidebar
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              filters={filters}
              onFilterChange={setFilters}
            />

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-muted-foreground">
                {t(filteredProducts.length === 1 ? 'productCount' : 'productsCount', { count: filteredProducts.length })}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
                        priceRange: [0, 500],
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
