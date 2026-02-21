"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductDetailClient } from "@/components/product/product-detail-client"
import { ProductReviews } from "@/components/product/product-reviews"
import { Loader2 } from "lucide-react"
import * as productService from "@/lib/product-service"
import type { Product } from "@/lib/product-service"
import * as recommendationService from "@/lib/recommendation-service"
import { motion, AnimatePresence } from "framer-motion"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params
        setLoading(true)
        setError("")

        // Fetch product detail from backend
        const productData = await productService.getProductById(id)
        setProduct(productData)

        // Fetch related/similar products from backend
        try {
          const similar = await recommendationService.getSimilarProducts(id)
          setRelatedProducts(similar.slice(0, 4))
        } catch {
          // If recommendations fail, try to get products from same category
          try {
            const categoryProducts = await productService.getProductsByCategory(productData.category)
            const related = categoryProducts.filter((p) => p.id !== id).slice(0, 4)
            setRelatedProducts(related)
          } catch {
            setRelatedProducts([])
          }
        }
      } catch (err) {
        console.error("Failed to fetch product from backend:", err)
        setError("Product not found. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex justify-center items-center"
          >
            <Loader2 className="w-8 h-8 animate-spin" />
          </motion.div>
        ) : error || !product ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex justify-center items-center"
          >
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error || "Product not found"}</p>
              <a href="/shop" className="text-primary hover:underline">
                Back to Shop
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />

            {/* Reviews Section */}
            <div className="bg-background border-t border-border">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <ProductReviews productId={product.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
