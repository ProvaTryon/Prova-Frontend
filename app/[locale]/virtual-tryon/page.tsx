"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { mockProducts } from "@/lib/mock-data"
import Image from "next/image"
import { Upload, X, Loader2, Download, Share2, ShoppingBag, Info } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function VirtualTryOnPage() {
  const t = useTranslations("virtualTryOn")
  const [userImage, setUserImage] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showProductSelector, setShowProductSelector] = useState(false)

  const { addItem } = useCart()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!userImage || !selectedProduct) {
      alert(t("uploadAlert"))
      return
    }

    setIsProcessing(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))
    // In a real app, this would call the HR-VITON API
    setResult(userImage) // Mock result
    setIsProcessing(false)
  }

  const handleAddToCart = () => {
    if (selectedProduct) {
      const product = mockProducts.find((p) => p.id === selectedProduct)
      if (product) {
        addItem(product, product.sizes[0], product.colors[0])
        alert(t("addedToCart"))
      }
    }
  }

  const selectedProductData = mockProducts.find((p) => p.id === selectedProduct)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

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
                        onClick={() => setUserImage(null)}
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
                <button className="px-8 py-4 border-2 border-foreground text-foreground rounded-full font-medium hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  {t("downloadResult")}
                </button>
                <button className="px-8 py-4 border border-border rounded-full font-medium hover:bg-muted transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  {t("share")}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setResult(null)
                    setUserImage(null)
                    setSelectedProduct(null)
                  }}
                  className="text-primary hover:underline"
                >
                  {t("tryAnotherItem")}
                </button>
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
          <div className="mt-24 pt-12 border-t border-border">
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
          </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mockProducts.map((product) => (
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
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
