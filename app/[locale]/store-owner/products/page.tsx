"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { productService, type Product } from "@/lib/product-service"
import { Search, Plus, Edit, Trash2, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductFormModal } from "@/components/admin/product-form-modal"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

// Default brands for merchants to choose from
const defaultBrands = [
  "Elegance",
  "Urban Style",
  "Luxe",
  "Minimalist",
  "Classic Wear",
  "Modern Fit",
  "Prova Collection",
]

export default function StoreOwnerProducts() {
  const t = useTranslations("storeOwner.products")
  const { user } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Derive unique brands from loaded products + default brands
  const availableBrands = useMemo(() => {
    const productBrands = products.map(p => p.brand).filter(Boolean) as string[]
    const allBrands = [...new Set([...defaultBrands, ...productBrands])]
    return allBrands.sort()
  }, [products])

  // Fetch products from backend - filtered by merchant ID
  useEffect(() => {
    fetchProducts()
  }, [user?.id])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Fetch products by merchant ID using the proper backend endpoint
      if (user?.id) {
        const merchantProducts = await productService.getProductsByMerchant(user.id)
        setProducts(merchantProducts || [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSubmitProduct = async (productData: Product | Omit<Product, "id">) => {
    try {
      setActionLoading("submit")

      // Transform frontend data to backend format
      // Auto-fill merchantName with logged-in user's name
      console.log('🔑 Auth user object:', JSON.stringify(user, null, 2))
      
      if (!user?.id) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again to create products.',
          variant: 'destructive',
        })
        return
      }

      const backendData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        salePrice: productData.salePrice || undefined,
        stock: productData.stock || 10,
        category: productData.category,
        images: productData.images || [productData.image],
        imagePublicId: (productData as any).imagePublicId || '',
        imagePublicIds: (productData as any).imagePublicIds || [],
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        brand: productData.brand,
        gender: (productData as any).gender || 'unisex',
        material: (productData as any).material || '',
        tags: (productData as any).tags || [],
        merchant: String(user.id),
        merchantName: user?.name || productData.merchantName || '',
      }

      if ('id' in productData && productData.id) {
        // Update existing product
        await productService.updateProduct(productData.id, backendData)
      } else {
        // Create new product
        await productService.createProduct(backendData)
      }

      // Refresh products list
      await fetchProducts()
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error: any) {
      console.error("Failed to save product:", error)
      toast({
        title: 'Failed to save product',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm(t("deleteConfirm"))) return

    try {
      setActionLoading(productId)

      // Find the product to get its Cloudinary public_ids
      const productToDelete = products.find((p) => p.id === productId)
      if (productToDelete) {
        const publicIds = ((productToDelete as any).imagePublicIds || []).filter(Boolean)
        if (publicIds.length > 0) {
          // Delete images from Cloudinary (fire-and-forget, don't block delete)
          fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_ids: publicIds }),
          }).catch((err) => console.error("Failed to cleanup Cloudinary images:", err))
        }
      }

      await productService.deleteProduct(productId)
      setProducts(products.filter((p) => p.id !== productId))
    } catch (error: any) {
      console.error("Failed to delete product:", error)
      toast({
        title: 'Failed to delete product',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </Button>
      </motion.div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card rounded-xl border shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">{t("product")}</th>
                <th className="text-left p-4 font-medium">{t("category")}</th>
                <th className="text-left p-4 font-medium">{t("price")}</th>
                <th className="text-left p-4 font-medium">{t("stock")}</th>
                <th className="text-left p-4 font-medium">{t("status")}</th>
                <th className="text-right p-4 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{product.category}</td>
                  <td className="p-4">
                    {product.salePrice ? (
                      <div>
                        <span className="line-through text-muted-foreground text-sm">${product.price}</span>
                        <span className="ml-2 text-red-600 font-medium">${product.salePrice}</span>
                      </div>
                    ) : (
                      <span className="font-medium">${product.price}</span>
                    )}
                  </td>
                  <td className="p-4">{product.stock || 0}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {product.inStock ? t("inStock") : t("outOfStock")}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        disabled={actionLoading === product.id}
                        title={t("editProduct")}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={actionLoading === product.id}
                        title={t("deleteProduct")}
                      >
                        {actionLoading === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("noProductsFound")}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? t("tryAdjusting") : t("getStarted")}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddProduct}>
                <Plus className="w-4 h-4 mr-2" />
                {t("addProduct")}
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
        availableBrands={availableBrands}
        userName={user?.name}
      />
    </div>
  )
}
