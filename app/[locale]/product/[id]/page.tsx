import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductDetailClient } from "@/components/product/product-detail-client"
import { mockProducts } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = mockProducts.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  const relatedProducts = mockProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      <Footer />
    </div>
  )
}
