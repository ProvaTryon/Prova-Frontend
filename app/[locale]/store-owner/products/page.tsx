"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { mockStores, mockProducts, type Product } from "@/lib/mock-data"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StoreOwnerProducts() {
  const t = useTranslations("storeOwner.products")
  const { user } = useAuth()
  const store = mockStores.find((s) => s.id === user?.storeId)
  const [products, setProducts] = useState<Product[]>(mockProducts.filter((p) => p.brand === store?.name))
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm(t("deleteConfirm"))) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </Button>
      </div>

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

      <div className="bg-card rounded-lg border overflow-hidden">
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
                <td className="p-4">{product.sizes.length} {t("sizes")}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                  >
                    {product.inStock ? t("inStock") : t("outOfStock")}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" title={t("editProduct")}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} title={t("actions")}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("noProductsFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? t("tryAdjusting") : t("getStarted")}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("addProduct")}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
