"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload, MultiImageUpload, type UploadedImage } from "@/components/ui/image-upload"
import type { Product } from "@/lib/product-service"

// Static category definitions
const defaultCategories = [
  { id: "women", name: "Women" },
  { id: "men", name: "Men" },
  { id: "accessories", name: "Accessories" },
]

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Product | Omit<Product, "id">) => void
  product?: Product | null
  availableBrands?: string[]
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  availableBrands = []
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    salePrice: "",
    category: "women",
    sizes: "",
    colors: "",
    description: "",
    inStock: true,
    gender: "unisex",
    material: "",
    tags: "",
    merchantName: "",
  })

  // ── Image state (Cloudinary objects) ──
  const [mainImage, setMainImage] = useState<UploadedImage | null>(null)
  const [additionalImages, setAdditionalImages] = useState<UploadedImage[]>([])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || "",
        category: product.category,
        sizes: product.sizes.join(", "),
        colors: product.colors.join(", "),
        description: product.description,
        inStock: product.inStock,
        gender: (product as any).gender || "unisex",
        material: (product as any).material || "",
        tags: (product as any).tags?.join(", ") || "",
        merchantName: product.merchantName || "",
      })

      // Populate image state from existing product URLs
      // When editing, we create UploadedImage objects from existing URLs.
      // public_id will be empty for legacy URL-based images — this is fine.
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
      setFormData({
        name: "",
        brand: "",
        price: "",
        salePrice: "",
        category: "women",
        sizes: "",
        colors: "",
        description: "",
        inStock: true,
        gender: "unisex",
        material: "",
        tags: "",
        merchantName: "",
      })
      setMainImage(null)
      setAdditionalImages([])
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Build image URL + public_id arrays for storage
    const allImageUrls = [
      ...(mainImage ? [mainImage.secure_url] : []),
      ...additionalImages.map((img) => img.secure_url),
    ]

    const allImagePublicIds = [
      ...(mainImage ? [mainImage.public_id] : []),
      ...additionalImages.map((img) => img.public_id),
    ]

    const productData = {
      ...(product && { id: product.id }),
      name: formData.name,
      brand: formData.brand,
      price: Number.parseFloat(formData.price),
      salePrice: formData.salePrice ? Number.parseFloat(formData.salePrice) : undefined,
      category: formData.category,
      sizes: formData.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: formData.colors.split(",").map((c) => c.trim()).filter(Boolean),
      image: mainImage?.secure_url || "",
      images: allImageUrls,
      // Pass public_ids alongside for Cloudinary cleanup
      imagePublicId: mainImage?.public_id || "",
      imagePublicIds: allImagePublicIds,
      description: formData.description,
      inStock: formData.inStock,
      gender: formData.gender,
      material: formData.material,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      merchantName: formData.merchantName,
    }

    onSubmit(productData as Product)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-serif text-2xl font-semibold">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="merchantName">Merchant Name</Label>
              <Input
                id="merchantName"
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                placeholder="Enter merchant name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Select brand</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
                {formData.brand && !availableBrands.includes(formData.brand) && (
                  <option value={formData.brand}>{formData.brand}</option>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                {defaultCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="salePrice">Sale Price ($)</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                required
              />
            </div>

            <div>
              <Label htmlFor="colors">Colors (comma separated)</Label>
              <Input
                id="colors"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="Black, White, Navy"
                required
              />
            </div>
          </div>

          {/* ── Image Uploads (Cloudinary) ── */}
          <ImageUpload
            label="Main Image"
            value={mainImage}
            onChange={setMainImage}
            required
          />

          <MultiImageUpload
            label="Additional Images"
            value={additionalImages}
            onChange={setAdditionalImages}
            maxImages={5}
          />

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="Cotton, Polyester, etc."
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="casual, summer, trending"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="inStock" className="cursor-pointer">
              In Stock
            </Label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" className="flex-1" disabled={!mainImage}>
              {product ? "Update Product" : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
