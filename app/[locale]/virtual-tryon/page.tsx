"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { productService, type Product } from "@/lib/product-service"
import {
  getVtonModel,
  getOotdCategory,
  processTryOnAndSave,
  processVton360TryOnAndSave,
  urlToFile,
  revokeObjectURL,
} from "@/lib/vton-service"
import Image from "next/image"
import { Upload, X, Loader2, Download, Share2, ShoppingBag, Info, AlertCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { motion, AnimatePresence } from "framer-motion"

export default function VirtualTryOnPage() {
  const t = useTranslations("virtualTryOn")
  const [userImage, setUserImage] = useState<string | null>(null)
  const [userImageFile, setUserImageFile] = useState<File | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  const { addItem } = useCart()

  // Load products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        const backendProducts = await productService.getAllProducts()
        setProducts(backendProducts)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store the file for API call
      setUserImageFile(file)
      setError(null)

      const reader = new FileReader()
      reader.onloadend = () => {
        setUserImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!userImage || !selectedProduct || !userImageFile) {
      alert(t("uploadAlert"))
      return
    }

    const selectedProductData = products.find((p) => p.id === selectedProduct)
    if (!selectedProductData) {
      setError("Selected product not found")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Convert product image URL to File
      const garmentImageFile = await urlToFile(
        selectedProductData.image,
        `garment-${selectedProductData.id}.jpg`
      )

      const model = getVtonModel(
        selectedProductData.category,
        selectedProductData.type,
        selectedProductData.name,
      )

      if (model === "vton360") {
        const saved = await processVton360TryOnAndSave(userImageFile, garmentImageFile, {
          productId: selectedProductData.id,
          productName: selectedProductData.name,
          productImage: selectedProductData.image,
          garmentCategory: selectedProductData.category,
        })
        setResult(saved.resultImageUrl)
      } else {
        const saved = await processTryOnAndSave(userImageFile, garmentImageFile, {
          category: getOotdCategory(
            selectedProductData.category,
            selectedProductData.type,
            selectedProductData.name,
          ),
          productId: selectedProductData.id,
          productName: selectedProductData.name,
          productImage: selectedProductData.image,
          garmentCategory: selectedProductData.category,
        })
        setResult(saved.resultImageUrl)
      }
    } catch (err: any) {
      console.error("Virtual try-on error:", err)
      setError(err.message || "Failed to process virtual try-on. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (result) {
        revokeObjectURL(result)
      }
    }
  }, [result])

  const handleAddToCart = () => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct)
      if (product) {
        addItem(product, product.sizes[0], product.colors[0])
        alert(t("addedToCart"))
      }
    }
  }

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* Guidelines */}
          <div className="mb-8 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">{t("photoGuidelines")}</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• {t("fullBody")}</li>
                  <li>• {t("standStraight")}</li>
                  <li>• {t("plainBackground")}</li>
                  <li>• {t("fittedClothing")}</li>
                </ul>
              </div>
            </div>
          </div>

          {!result ? (
            /* Upload and Selection Interface */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Upload Photo */}
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">1. {t("uploadPhoto")}</h2>
                <div className="relative aspect-[3/4] border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted hover:border-primary transition-colors">
                  {userImage ? (
                    <>
                      <Image src={userImage || "/placeholder.svg"} alt="User photo" fill className="object-cover" />
                      <button
                        onClick={() => {
                          setUserImage(null)
                          setUserImageFile(null)
                        }}
                        className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
                        title="Remove"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">{t("clickUpload")}</p>
                      <p className="text-sm text-muted-foreground">{t("fileSize")}</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Select Clothing */}
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">2. {t("selectClothing")}</h2>
                <div className="relative aspect-[3/4] border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted hover:border-primary transition-colors">
                  {selectedProductData ? (
                    <>
                      <Image
                        src={selectedProductData.image || "/placeholder.svg"}
                        alt={selectedProductData.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                        <p className="text-sm text-muted-foreground no-flip">{selectedProductData.brand}</p>
                        <p className="font-medium no-flip">{selectedProductData.name}</p>
                        <p className="text-sm font-semibold no-flip">
                          ${selectedProductData.salePrice || selectedProductData.price}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
                        title="Remove"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowProductSelector(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">{t("selectFromCatalog")}</p>
                      <p className="text-sm text-muted-foreground">{t("browseCatalog")}</p>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Interface */
            <div className="space-y-8 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Original */}
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-medium">{t("originalPhoto")}</h2>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <Image src={userImage! || "/placeholder.svg"} alt="Original" fill className="object-cover" />
                  </div>
                </div>

                {/* Result */}
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-medium">{t("tryOnResult")}</h2>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <Image src={result || "/placeholder.svg"} alt="Try-on result" fill className="object-cover" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {t("aiGenerated")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleAddToCart}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t("addToCart")}
                </button>
                <button
                  onClick={() => {
                    if (result) {
                      const link = document.createElement('a')
                      link.href = result
                      link.download = `virtual-tryon-${Date.now()}.png`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }
                  }}
                  className="px-8 py-4 border-2 border-foreground text-foreground rounded-full font-medium hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t("downloadResult")}
                </button>
                <button
                  onClick={async () => {
                    if (result && navigator.share) {
                      try {
                        const response = await fetch(result)
                        const blob = await response.blob()
                        const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' })
                        await navigator.share({
                          files: [file],
                          title: 'Virtual Try-On Result',
                        })
                      } catch (err) {
                        console.error('Share failed:', err)
                      }
                    } else {
                      // Fallback: copy URL or show message
                      alert('Sharing is not supported on this device')
                    }
                  }}
                  className="px-8 py-4 border border-border rounded-full font-medium hover:bg-muted transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  {t("share")}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setResult(null)
                    setUserImage(null)
                    setUserImageFile(null)
                    setSelectedProduct(null)
                    setError(null)
                  }}
                  className="text-primary hover:underline"
                >
                  {t("tryAnotherItem")}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!result && (
            <div className="text-center">
              <button
                onClick={handleGenerate}
                disabled={!userImage || !selectedProduct || isProcessing}
                className="px-12 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  t("generateTryOn")
                )}
              </button>
              {isProcessing && (
                <p className="text-sm text-muted-foreground mt-4">
                  {t("processingTime")}
                </p>
              )}
            </div>
          )}

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 pt-12 border-t border-border"
          >
            <h2 className="font-serif text-3xl font-medium text-center mb-12">{t("howItWorks")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-serif font-semibold mx-auto mb-4 text-primary">
                  1
                </div>
                <h3 className="font-serif text-xl font-medium mb-2">{t("step1Title")}</h3>
                <p className="text-muted-foreground">{t("step1Desc")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-serif font-semibold mx-auto mb-4 text-primary">
                  2
                </div>
                <h3 className="font-serif text-xl font-medium mb-2">{t("step2Title")}</h3>
                <p className="text-muted-foreground">{t("step2Desc")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-serif font-semibold mx-auto mb-4 text-primary">
                  3
                </div>
                <h3 className="font-serif text-xl font-medium mb-2">{t("step3Title")}</h3>
                <p className="text-muted-foreground">{t("step3Desc")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl font-medium">{t("selectItem")}</h2>
              <button onClick={() => setShowProductSelector(false)} className="p-2 hover:bg-muted rounded-full" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No products available
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product.id)
                        setShowProductSelector(false)
                      }}
                      className="group text-left"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-2">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm font-semibold">${product.salePrice || product.price}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
