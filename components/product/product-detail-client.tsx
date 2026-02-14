"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Heart, Minus, Plus, Check, ShoppingBag } from "lucide-react"
import type { Product } from "@/lib/product-service"
import { ProductCard } from "@/components/product/product-card"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailClientProps {
  product: any
  relatedProducts: any[]
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  // Map backend Product (_id) to frontend Product (id)
  const mappedProduct = {
    id: product._id || product.id || "",
    name: product.name,
    brand: product.brand || "Fashion Brand",
    price: product.price,
    category: product.category,
    sizes: product.sizes || [],
    colors: product.colors || [],
    image: product.image || "",
    images: product.images || [product.image],
    description: product.description || "",
    inStock: product.inStock !== false,
  }

  const mappedRelated = relatedProducts.map((p: any) => ({
    id: p._id || p.id || "",
    name: p.name,
    brand: p.brand || "Fashion Brand",
    price: p.price,
    category: p.category,
    sizes: p.sizes || [],
    colors: p.colors || [],
    image: p.image || "",
    images: p.images || [p.image],
    description: p.description || "",
    inStock: p.inStock !== false,
  }))

  const t = useTranslations("productDetail")
  const tCommon = useTranslations("common")
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const isWishlisted = isInWishlist(mappedProduct.id)

  const canAddToCart = selectedSize && selectedColor

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: t("selectSizeAndColor"),
        description: !selectedSize && !selectedColor
          ? t("pleaseSelectBoth") || "Please select a size and color"
          : !selectedSize
            ? t("pleaseSelectSize") || "Please select a size"
            : t("pleaseSelectColor") || "Please select a color",
        variant: "destructive",
      })
      return
    }

    addItem(mappedProduct, selectedSize, selectedColor, quantity)
    setAddedToCart(true)
    toast({
      title: t("addedToCart"),
      description: `${mappedProduct.name} - ${selectedSize} / ${selectedColor}`,
    })
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(mappedProduct.id)
    } else {
      addToWishlist(mappedProduct)
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
          <span className="text-foreground no-flip">{mappedProduct.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <Image
                src={mappedProduct.images[selectedImage] || mappedProduct.image}
                alt={mappedProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {mappedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden border-2 transition-colors ${selectedImage === idx ? "border-foreground" : "border-transparent"
                    }`}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                  title={`View image ${idx + 1}`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${mappedProduct.name} view ${idx + 1}`}
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
              <p className="text-overline text-muted-foreground mb-2 no-flip">{mappedProduct.brand}</p>
              <h1 className="font-serif text-4xl font-medium mb-4 no-flip">{mappedProduct.name}</h1>
              <div className="flex items-center gap-3 no-flip">
                {mappedProduct.salePrice ? (
                  <>
                    <span className="text-3xl font-semibold tabular-nums">${mappedProduct.salePrice}</span>
                    <span className="text-xl text-muted-foreground line-through tabular-nums">${mappedProduct.price}</span>
                    <span className="px-3 py-1 bg-foreground/10 text-foreground text-sm font-medium">
                      {t("save")} ${mappedProduct.price - mappedProduct.salePrice}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold tabular-nums">${mappedProduct.price}</span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed no-flip">{mappedProduct.description}</p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                {t("color")}: {selectedColor && <span className="font-normal text-muted-foreground no-flip">{selectedColor}</span>}
              </label>
              <div className="flex gap-2">
                {mappedProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 transition-all no-flip ${selectedColor === color
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
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
                {mappedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 transition-all no-flip ${selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
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
                <div className="flex items-center border border-border">
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
              {/* Variant selection hint */}
              {!canAddToCart && (
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {!selectedSize && !selectedColor
                    ? t("pleaseSelectBoth") || "Please select a size and color to add to cart"
                    : !selectedSize
                      ? t("pleaseSelectSize") || "Please select a size"
                      : t("pleaseSelectColor") || "Please select a color"}
                </p>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                  canAddToCart
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
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
                className="w-full py-4 border-2 border-foreground text-foreground font-medium hover:bg-foreground hover:text-background transition-all flex items-center justify-center"
              >
                {t("tryOnVirtually")}
              </Link>
              <button
                onClick={handleWishlistToggle}
                className="w-full py-4 border border-border font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-accent text-accent" : ""}`} />
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
