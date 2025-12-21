"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/mock-data"
import { useWishlist } from "@/lib/wishlist-context"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('product')
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-3">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.salePrice && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              {t('sale')}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground no-flip">{product.brand}</p>
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors no-flip">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="font-semibold text-primary no-flip">${product.salePrice}</span>
                <span className="text-sm text-muted-foreground line-through no-flip">${product.price}</span>
              </>
            ) : (
              <span className="font-semibold no-flip">${product.price}</span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 w-9 h-9 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
        aria-label={isWishlisted ? t('addToWishlist') : t('addToWishlist')}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
      </button>
    </div>
  )
}
