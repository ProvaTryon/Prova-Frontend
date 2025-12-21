"use client";

import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Heart, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const tProduct = useTranslations("product");
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity: 1,
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0] || "Default",
    })
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-medium mb-4">{t("empty")}</h1>
            <p className="text-muted-foreground mb-8">{t("emptySubtitle")}</p>
            <Button asChild size="lg">
              <Link href="/shop">{t("continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length === 1
              ? t("itemCount", { count: wishlistItems.length })
              : t("itemsCount", { count: wishlistItems.length })
            }
          </p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="group relative bg-card rounded-lg overflow-hidden border">
              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
                aria-label="Remove from wishlist"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product Image */}
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.salePrice && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {tProduct("sale")}
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <Link href={`/product/${product.id}`}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide no-flip">{product.brand}</p>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 no-flip">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 no-flip">
                    {product.salePrice ? (
                      <>
                        <span className="font-semibold text-primary">${product.salePrice}</span>
                        <span className="text-sm text-muted-foreground line-through">${product.price}</span>
                      </>
                    ) : (
                      <span className="font-semibold">${product.price}</span>
                    )}
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <Button onClick={() => handleAddToCart(product)} className="w-full" size="sm">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t("addToCart")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
