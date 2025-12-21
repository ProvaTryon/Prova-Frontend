"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { brands, categories } from "@/lib/mock-data"
import { useTranslations } from "next-intl"

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    category: string
    brands: string[]
    priceRange: [number, number]
    sizes: string[]
  }
  onFilterChange: (filters: any) => void
}

export function FilterSidebar({ isOpen, onClose, filters, onFilterChange }: FilterSidebarProps) {
  const t = useTranslations('shop')
  const [localFilters, setLocalFilters] = useState(filters)

  const handleCategoryChange = (categoryId: string) => {
    const newFilters = { ...localFilters, category: categoryId }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleBrandToggle = (brand: string) => {
    const newBrands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter((b) => b !== brand)
      : [...localFilters.brands, brand]
    const newFilters = { ...localFilters, brands: newBrands }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearAll = () => {
    const clearedFilters = {
      category: "all",
      brands: [],
      priceRange: [0, 500] as [number, number],
      sizes: [],
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden cursor-default border-0"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
          aria-label="Close filters"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-background z-50 lg:z-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        overflow-y-auto border-r border-border p-6
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h2 className="font-serif text-xl font-semibold">{t('filters')}</h2>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-muted rounded-full" aria-label="Close filters">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear All */}
        <button
          onClick={handleClearAll}
          className="w-full mb-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('clearAll')}
        </button>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">{t('category')}</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={localFilters.category === category.id}
                  onChange={() => handleCategoryChange(category.id)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">{t('brand')}</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">{t('priceRange')}</h3>
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="500"
              value={localFilters.priceRange[1]}
              onChange={(e) => {
                const newFilters = {
                  ...localFilters,
                  priceRange: [0, Number.parseInt(e.target.value)] as [number, number],
                }
                setLocalFilters(newFilters)
                onFilterChange(newFilters)
              }}
              className="w-full accent-primary"
              aria-label={t('priceRange')}
              title={t('priceRange')}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${localFilters.priceRange[0]}</span>
              <span>${localFilters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="font-semibold mb-4">{t('size')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                onClick={() => {
                  const newSizes = localFilters.sizes.includes(size)
                    ? localFilters.sizes.filter((s) => s !== size)
                    : [...localFilters.sizes, size]
                  const newFilters = { ...localFilters, sizes: newSizes }
                  setLocalFilters(newFilters)
                  onFilterChange(newFilters)
                }}
                className={`
                  py-2 text-sm rounded-md border transition-all
                  ${localFilters.sizes.includes(size)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
