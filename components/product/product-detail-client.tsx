"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Heart, Minus, Plus, Check } from "lucide-react"
import type { Product } from "@/lib/mock-data"
import { ProductCard } from "@/components/product/product-card"
import { useTranslations } from "next-intl"

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const t = useTranslations("productDetail")
  const tCommon = useTranslations("common")
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert(t("selectSizeAndColor"))
      return
    }

    addItem(product, selectedSize, selectedColor, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            {t("home")}
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground">
            {tCommon("shop")}
          </Link>
          <span>/</span>
          <span className="text-foreground no-flip">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                  title={`View image ${idx + 1}`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2 no-flip">{product.brand}</p>
              <h1 className="font-serif text-4xl font-medium mb-4 no-flip">{product.name}</h1>
              <div className="flex items-center gap-3 no-flip">
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-semibold text-primary">${product.salePrice}</span>
                    <span className="text-xl text-muted-foreground line-through">${product.price}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {t("save")} ${product.price - product.salePrice}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold">${product.price}</span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed no-flip">{product.description}</p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                {t("color")}: {selectedColor && <span className="font-normal text-muted-foreground no-flip">{selectedColor}</span>}
              </label>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all no-flip ${selectedColor === color
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                {t("size")}: {selectedSize && <span className="font-normal text-muted-foreground no-flip">{selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all no-flip ${selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold mb-3">{t("quantity")}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t("addedToCart")}
                  </>
                ) : (
                  t("addToCart")
                )}
              </button>
              <Link
                href="/virtual-tryon"
                className="w-full py-4 border-2 border-foreground text-foreground rounded-lg font-medium hover:bg-foreground hover:text-background transition-all flex items-center justify-center"
              >
                {t("tryOnVirtually")}
              </Link>
              <button
                onClick={handleWishlistToggle}
                className="w-full py-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
                {isWishlisted ? t("removeFromWishlist") : t("addToWishlist")}
              </button>
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t border-border space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t("productDetails")}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("premiumMaterials")}</li>
                  <li>• {t("craftedConstruction")}</li>
                  <li>• {t("availableMultiple")}</li>
                  <li>• {t("freeShipping")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-serif text-3xl font-medium mb-8">{t("youMayLike")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
