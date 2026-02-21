"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload, MultiImageUpload, type UploadedImage } from "@/components/ui/image-upload"
import type { Product } from "@/lib/product-service"

// ── Preset Options ──
const CATEGORIES = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "accessories", label: "Accessories" },
  { id: "shoes", label: "Shoes" },
  { id: "bags", label: "Bags" },
  { id: "jewelry", label: "Jewelry" },
]

const TYPES = [
  "T-Shirt", "Shirt", "Pants", "Jeans", "Shorts",
  "Jacket", "Coat", "Hoodie", "Sweater",
  "Dress", "Skirt", "Blouse",
  "Belt", "Shoes", "Bag", "Accessory"
]

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"]

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Red", hex: "#dc2626" },
  { name: "Beige", hex: "#d4b896" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Olive", hex: "#808000" },
]

const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "unisex", label: "Unisex" },
]

const PRESET_MATERIALS = [
  "Cotton", "Polyester", "Silk", "Linen", "Wool",
  "Denim", "Leather", "Cashmere", "Chiffon", "Satin",
  "Nylon", "Velvet",
]

const PRESET_TAGS = [
  "Casual", "Formal", "Summer", "Winter", "Spring",
  "Trending", "New Arrival", "Best Seller", "Limited Edition",
  "Elegant", "Sporty", "Vintage", "Streetwear", "Party",
]

// ── Chip Toggle Component ──
function ChipToggle({
  label,
  selected,
  onToggle,
  colorHex,
}: {
  label: string
  selected: boolean
  onToggle: () => void
  colorHex?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-200 cursor-pointer select-none
        ${selected
          ? "bg-foreground text-background border-foreground shadow-sm"
          : "bg-background text-foreground/70 border-border hover:border-foreground/40 hover:text-foreground"
        }
      `}
    >
      {colorHex && (
        <span
          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
          style={{ backgroundColor: colorHex }}
        />
      )}
      {label}
      {selected && <Check className="w-3 h-3" />}
    </button>
  )
}

// ── Custom Input with Add Button ──
function AddCustomInput({
  placeholder,
  onAdd,
}: {
  placeholder: string
  onAdd: (value: string) => void
}) {
  const [value, setValue] = useState("")

  const handleAdd = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onAdd(trimmed)
      setValue("")
    }
  }

  return (
    <div className="flex gap-2 mt-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-8 text-xs"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleAdd()
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="h-8 px-2"
        disabled={!value.trim()}
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

// ── Section Wrapper ──
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground">{title}</h3>
      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
        {children}
      </div>
    </div>
  )
}

// ── Main Component ──
interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Product | Omit<Product, "id">) => void
  product?: Product | null
  availableBrands?: string[]
  userName?: string
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  availableBrands = [],
  userName,
}: ProductFormModalProps) {
  // ── Basic fields ──
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [customBrand, setCustomBrand] = useState("")
  const [price, setPrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [description, setDescription] = useState("")
  const [inStock, setInStock] = useState(true)
  const [stock, setStock] = useState("10")
  const [merchantName, setMerchantName] = useState("")

  // ── Multi-select fields ──
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["women"])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColors, setCustomColors] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>(["unisex"])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [customMaterials, setCustomMaterials] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])

  // ── Images ──
  const [mainImage, setMainImage] = useState<UploadedImage | null>(null)
  const [additionalImages, setAdditionalImages] = useState<UploadedImage[]>([])

  // ── Toggle helper ──
  const toggle = useCallback((arr: string[], val: string): string[] => {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
  }, [])

  // ── Populate form on edit ──
  useEffect(() => {
    if (product) {
      setName(product.name)
      setBrand(product.brand)
      setPrice(product.price.toString())
      setSalePrice(product.salePrice?.toString() || "")
      setDescription(product.description)
      setInStock(product.inStock)
      setStock(product.stock?.toString() || "10")
      setMerchantName(product.merchantName || userName || "")

      // Category - handle both single string and comma-separated
      const cats = product.category.split(",").map((c) => c.trim()).filter(Boolean)
      setSelectedCategories(cats.length > 0 ? cats : ["women"])

      // Type
      const type = (product as any).type || ""
      const types = type.split(",").map((t: string) => t.trim()).filter(Boolean)
      setSelectedTypes(types)

      setSelectedSizes(product.sizes || [])

      // Colors - separate preset from custom
      const presetColorNames = PRESET_COLORS.map((c) => c.name)
      const productColors = product.colors || []
      setSelectedColors(productColors.filter((c) => presetColorNames.includes(c)))
      setCustomColors(productColors.filter((c) => !presetColorNames.includes(c)))

      // Gender
      const gender = (product as any).gender || "unisex"
      setSelectedGenders(gender.split(",").map((g: string) => g.trim()).filter(Boolean))

      // Materials
      const material = (product as any).material || ""
      const mats = material.split(",").map((m: string) => m.trim()).filter(Boolean)
      setSelectedMaterials(mats.filter((m: string) => PRESET_MATERIALS.includes(m)))
      setCustomMaterials(mats.filter((m: string) => !PRESET_MATERIALS.includes(m)))

      // Tags
      const tags = (product as any).tags || []
      const presetTagLabels = PRESET_TAGS.map((t) => t.toLowerCase())
      setSelectedTags(tags.filter((t: string) => presetTagLabels.includes(t.toLowerCase())))
      setCustomTags(tags.filter((t: string) => !presetTagLabels.includes(t.toLowerCase())))

      // Images
      if (product.image) {
        setMainImage({
          secure_url: product.image,
          public_id: (product as any).imagePublicId || "",
        })
      } else {
        setMainImage(null)
      }

      if (product.images && product.images.length > 0) {
        const publicIds: string[] = (product as any).imagePublicIds || []
        setAdditionalImages(
          product.images.map((url, i) => ({
            secure_url: url,
            public_id: publicIds[i] || "",
          })),
        )
      } else {
        setAdditionalImages([])
      }
    } else {
      // Reset all
      setName("")
      setBrand("")
      setCustomBrand("")
      setPrice("")
      setSalePrice("")
      setDescription("")
      setInStock(true)
      setStock("10")
      setMerchantName(userName || "")
      setSelectedCategories(["women"])
      setSelectedTypes([])
      setSelectedSizes([])
      setSelectedColors([])
      setCustomColors([])
      setSelectedGenders(["unisex"])
      setSelectedMaterials([])
      setCustomMaterials([])
      setSelectedTags([])
      setCustomTags([])
      setMainImage(null)
      setAdditionalImages([])
    }
  }, [product, isOpen, userName])

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const allColors = [...selectedColors, ...customColors]
    const allMaterials = [...selectedMaterials, ...customMaterials]
    const allTags = [...selectedTags, ...customTags]

    const allImageUrls = [
      ...(mainImage ? [mainImage.secure_url] : []),
      ...additionalImages.map((img) => img.secure_url),
    ]
    const allImagePublicIds = [
      ...(mainImage ? [mainImage.public_id] : []),
      ...additionalImages.map((img) => img.public_id),
    ]

    const finalBrand = brand === "__custom" ? customBrand : brand

    const productData = {
      ...(product && { id: product.id }),
      name,
      brand: finalBrand,
      price: Number.parseFloat(price),
      salePrice: salePrice ? Number.parseFloat(salePrice) : undefined,
      category: selectedCategories.join(","),
      type: selectedTypes.join(","),
      sizes: selectedSizes,
      colors: allColors,
      image: mainImage?.secure_url || "",
      images: allImageUrls,
      imagePublicId: mainImage?.public_id || "",
      imagePublicIds: allImagePublicIds,
      description,
      inStock,
      stock: parseInt(stock) || 10,
      gender: selectedGenders.join(","),
      material: allMaterials.join(","),
      tags: allTags,
      merchantName,
    }

    onSubmit(productData as Product)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto m-4 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border px-6 py-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="font-serif text-2xl font-semibold">{product ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-xs text-muted-foreground mt-1">Fill in the details below to {product ? "update" : "create"} your product</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* ═══ Basic Info ═══ */}
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-xs">Product Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Oxford Shirt"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="merchantName" className="text-xs">Merchant Name</Label>
                <Input
                  id="merchantName"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Enter merchant name"
                  required
                  readOnly={!!userName}
                  className={`mt-1 ${userName ? "bg-muted cursor-not-allowed" : ""}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="brand" className="text-xs">Brand</Label>
                <select
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm mt-1"
                  required
                >
                  <option value="">Select brand</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom">+ Add Custom Brand</option>
                  {brand && brand !== "__custom" && !availableBrands.includes(brand) && (
                    <option value={brand}>{brand}</option>
                  )}
                </select>
                {brand === "__custom" && (
                  <Input
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Enter brand name"
                    required
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background text-sm mt-1 resize-y"
                  placeholder="Describe your product..."
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* ═══ Pricing & Stock ═══ */}
          <FormSection title="Pricing & Stock">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="99.99"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Sale Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="79.99"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-sm font-medium">In Stock</span>
                </label>
              </div>
            </div>
          </FormSection>

          {/* ═══ Categories ═══ */}
          <FormSection title="Categories">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <ChipToggle
                  key={cat.id}
                  label={cat.label}
                  selected={selectedCategories.includes(cat.id)}
                  onToggle={() => setSelectedCategories(toggle(selectedCategories, cat.id))}
                />
              ))}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-destructive mt-2">Please select at least one category</p>
            )}
          </FormSection>

          {/* ═══ Types ═══ */}
          <FormSection title="Types">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <ChipToggle
                  key={type}
                  label={type}
                  selected={selectedTypes.includes(type)}
                  onToggle={() => setSelectedTypes(toggle(selectedTypes, type))}
                />
              ))}
            </div>
          </FormSection>

          {/* ═══ Sizes ═══ */}
          <FormSection title="Sizes">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <ChipToggle
                  key={size}
                  label={size}
                  selected={selectedSizes.includes(size)}
                  onToggle={() => setSelectedSizes(toggle(selectedSizes, size))}
                />
              ))}
            </div>
          </FormSection>

          {/* ═══ Colors ═══ */}
          <FormSection title="Colors">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <ChipToggle
                  key={color.name}
                  label={color.name}
                  colorHex={color.hex}
                  selected={selectedColors.includes(color.name)}
                  onToggle={() => setSelectedColors(toggle(selectedColors, color.name))}
                />
              ))}
              {customColors.map((color) => (
                <ChipToggle
                  key={`custom-${color}`}
                  label={color}
                  selected={true}
                  onToggle={() => setCustomColors(customColors.filter((c) => c !== color))}
                />
              ))}
            </div>
            <AddCustomInput
              placeholder="Add custom color..."
              onAdd={(val) => {
                if (!selectedColors.includes(val) && !customColors.includes(val)) {
                  setCustomColors([...customColors, val])
                }
              }}
            />
          </FormSection>

          {/* ═══ Gender ═══ */}
          <FormSection title="Gender">
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <ChipToggle
                  key={g.id}
                  label={g.label}
                  selected={selectedGenders.includes(g.id)}
                  onToggle={() => setSelectedGenders(toggle(selectedGenders, g.id))}
                />
              ))}
            </div>
          </FormSection>

          {/* ═══ Material ═══ */}
          <FormSection title="Material">
            <div className="flex flex-wrap gap-2">
              {PRESET_MATERIALS.map((mat) => (
                <ChipToggle
                  key={mat}
                  label={mat}
                  selected={selectedMaterials.includes(mat)}
                  onToggle={() => setSelectedMaterials(toggle(selectedMaterials, mat))}
                />
              ))}
              {customMaterials.map((mat) => (
                <ChipToggle
                  key={`custom-${mat}`}
                  label={mat}
                  selected={true}
                  onToggle={() => setCustomMaterials(customMaterials.filter((m) => m !== mat))}
                />
              ))}
            </div>
            <AddCustomInput
              placeholder="Add custom material..."
              onAdd={(val) => {
                if (!selectedMaterials.includes(val) && !customMaterials.includes(val)) {
                  setCustomMaterials([...customMaterials, val])
                }
              }}
            />
          </FormSection>

          {/* ═══ Tags ═══ */}
          <FormSection title="Tags">
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <ChipToggle
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onToggle={() => setSelectedTags(toggle(selectedTags, tag))}
                />
              ))}
              {customTags.map((tag) => (
                <ChipToggle
                  key={`custom-${tag}`}
                  label={tag}
                  selected={true}
                  onToggle={() => setCustomTags(customTags.filter((t) => t !== tag))}
                />
              ))}
            </div>
            <AddCustomInput
              placeholder="Add custom tag..."
              onAdd={(val) => {
                if (!selectedTags.includes(val) && !customTags.includes(val)) {
                  setCustomTags([...customTags, val])
                }
              }}
            />
          </FormSection>

          {/* ═══ Images ═══ */}
          <FormSection title="Product Images">
            <ImageUpload
              label="Main Image"
              value={mainImage}
              onChange={setMainImage}
              required
            />
            <div className="mt-4">
              <MultiImageUpload
                label="Additional Images"
                value={additionalImages}
                onChange={setAdditionalImages}
                maxImages={5}
              />
            </div>
          </FormSection>

          {/* ═══ Actions ═══ */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              className="flex-1 h-12 text-sm font-semibold rounded-xl"
              disabled={!mainImage || selectedCategories.length === 0}
            >
              {product ? "Update Product" : "Add Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-sm font-semibold rounded-xl bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
