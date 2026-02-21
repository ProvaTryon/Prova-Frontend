"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

// Static category definitions
const defaultCategories = [
  { id: "all", name: "All Items" },
  { id: "women", name: "Women" },
  { id: "men", name: "Men" },
  { id: "accessories", name: "Accessories" },
]

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    category: string
    types: string[]
    brands: string[]
    priceRange: [number, number]
    sizes: string[]
  }
  onFilterChange: (filters: any) => void
  availableBrands?: string[]
  availableTypes?: string[]
  categories?: { id: string; name: string }[]
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  availableBrands = [],
  availableTypes = [
    "T-Shirt", "Shirt", "Pants", "Jeans", "Shorts",
    "Jacket", "Coat", "Hoodie", "Sweater",
    "Dress", "Skirt", "Blouse",
    "Belt", "Shoes", "Bag", "Accessory"
  ],
  categories = defaultCategories
}: FilterSidebarProps) {
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

  const handleTypeToggle = (type: string) => {
    const newTypes = localFilters.types?.includes(type)
      ? localFilters.types.filter((t) => t !== type)
      : [...(localFilters.types || []), type]
    const newFilters = { ...localFilters, types: newTypes }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearAll = () => {
    const clearedFilters = {
      category: "all",
      types: [],
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
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-muted" aria-label="Close filters">
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
          <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-4">{t('category')}</h3>
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

        {/* Types */}
        <div className="mb-8">
          <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-4">{t('type') || 'Type'}</h3>
          <div className="space-y-2">
            {availableTypes.length > 0 ? (
              availableTypes.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.types?.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">{type}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No types available</p>
            )}
          </div>
        </div>

        {/* Brands */}
        <div className="mb-8">
          <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-4">{t('brand')}</h3>
          <div className="space-y-2">
            {availableBrands.length > 0 ? (
              availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.brands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">{brand}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No brands available</p>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-4">{t('priceRange')}</h3>
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
          <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-4">{t('size')}</h3>
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
                  py-2 text-sm border transition-all
                  ${localFilters.sizes.includes(size)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
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
