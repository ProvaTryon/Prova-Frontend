"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/product-service"
import { useWishlist } from "@/lib/wishlist-context"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

const PLACEHOLDER = "/placeholder.svg"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('product')
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  const [imgSrc, setImgSrc] = useState(product.image || PLACEHOLDER)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null

  return (
    <div className="group relative" data-testid="product-card" data-category={product.category} data-brand={product.brand}>
      <Link href={`/product/${product.id}`} className="block">
        {/* Image — no rounded corners for editorial feel */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgSrc(PLACEHOLDER)}
          />

          {/* Sale badge — top-left, editorial style */}
          {product.salePrice && (
            <div className="absolute top-3 start-3 bg-foreground text-background px-3 py-1 text-[11px] font-medium tracking-wider uppercase">
              -{discount}%
            </div>
          )}

          {/* Quick View overlay — appears on hover (desktop) */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-end justify-center pb-5">
            <span className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-background/95 backdrop-blur-sm text-foreground px-6 py-2.5 text-[11px] font-medium tracking-[0.1em] uppercase hidden md:block">
              {t('quickView') || 'Quick View'}
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1">
          {/* Brand — overline style */}
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground no-flip">
            {product.brand}
            {product.category && (
              <span className="ml-2 text-[10px] opacity-70" data-testid="product-category">· {product.category}</span>
            )}
          </p>

          {/* Product name */}
          <h3 className="text-sm font-medium leading-snug group-hover:text-muted-foreground transition-colors duration-200 no-flip line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 pt-0.5">
            {product.salePrice ? (
              <>
                <span className="text-sm font-semibold tabular-nums no-flip">
                  ${product.salePrice}
                </span>
                <span className="text-xs text-muted-foreground line-through tabular-nums no-flip">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold tabular-nums no-flip">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist — visible on mobile, hover-reveal on desktop */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 end-3 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
        aria-label={isWishlisted ? t('addToWishlist') : t('addToWishlist')}
      >
        <Heart
          className={`w-4 h-4 transition-all duration-200 ${isWishlisted
            ? "fill-accent text-accent scale-110"
            : "text-foreground/70 hover:text-foreground"
            }`}
        />
      </button>
    </div>
  )
}
