"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { mockProducts, type Product } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductFormModal } from "@/components/admin/product-form-modal"

export default function ProductsManagement() {
  const t = useTranslations('admin.products')
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    }
    setProducts([newProduct, ...products])
    setIsModalOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setProducts(products.map((p) => (p.id === product.id ? product : p)))
    setEditingProduct(null)
    setIsModalOpen(false)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm(t('deleteConfirm'))) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('addProduct')}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('product')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('brand')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('category')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('price')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('stock')}</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sizes.length} {t('sizes')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.brand}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-muted text-xs font-medium rounded capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      {product.salePrice ? (
                        <>
                          <span className="font-medium">${product.salePrice}</span>
                          <span className="text-sm text-muted-foreground line-through ml-2">${product.price}</span>
                        </>
                      ) : (
                        <span className="font-medium">${product.price}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                    >
                      {product.inStock ? t('inStock') : t('outOfStock')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={t('actions')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title={t('actions')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noProductsFound')}</p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        product={editingProduct}
      />
    </div>
  )
}
