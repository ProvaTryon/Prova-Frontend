"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/mock-data"
import { brands, categories } from "@/lib/mock-data"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Product | Omit<Product, "id">) => void
  product?: Product | null
}

export function ProductFormModal({ isOpen, onClose, onSubmit, product }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    salePrice: "",
    category: "women",
    sizes: "",
    colors: "",
    image: "",
    images: "",
    description: "",
    inStock: true,
  })

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
        image: product.image,
        images: product.images.join(", "),
        description: product.description,
        inStock: product.inStock,
      })
    } else {
      setFormData({
        name: "",
        brand: "",
        price: "",
        salePrice: "",
        category: "women",
        sizes: "",
        colors: "",
        image: "",
        images: "",
        description: "",
        inStock: true,
      })
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      ...(product && { id: product.id }),
      name: formData.name,
      brand: formData.brand,
      price: Number.parseFloat(formData.price),
      salePrice: formData.salePrice ? Number.parseFloat(formData.salePrice) : undefined,
      category: formData.category,
      sizes: formData.sizes.split(",").map((s) => s.trim()),
      colors: formData.colors.split(",").map((c) => c.trim()),
      image: formData.image,
      images: formData.images.split(",").map((i) => i.trim()),
      description: formData.description,
      inStock: formData.inStock,
    }

    onSubmit(productData as Product)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
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
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                {categories
                  .filter((cat) => cat.id !== "all")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
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

          <div>
            <Label htmlFor="image">Main Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/path/to/image.jpg"
              required
            />
          </div>

          <div>
            <Label htmlFor="images">Additional Images (comma separated URLs)</Label>
            <Input
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="/image1.jpg, /image2.jpg"
            />
          </div>

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
            <Button type="submit" className="flex-1">
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
