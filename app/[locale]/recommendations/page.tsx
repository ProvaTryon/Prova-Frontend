"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { mockProducts } from "@/lib/mock-data"
import { Sparkles, RefreshCw, TrendingUp, Heart } from "lucide-react"
import { useTranslations } from "next-intl"

export default function RecommendationsPage() {
  const t = useTranslations("recommendations")
  // Mock personalized recommendations
  const forYou = mockProducts.slice(0, 4)
  const completeTheLook = mockProducts.slice(4, 7)
  const trending = mockProducts.filter((p) => p.salePrice).slice(0, 4)
  const newArrivals = mockProducts.slice(7, 11)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {t("personalizedBadge")}
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Based on Your Browsing */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-3xl font-medium">{t("forYou.title")}</h2>
              </div>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-4 h-4" />
                {t("forYou.refresh")}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {forYou.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Complete the Look */}
          <section className="mb-16 p-8 bg-muted rounded-2xl">
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-medium mb-2">{t("completeLook.title")}</h2>
              <p className="text-muted-foreground">{t("completeLook.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completeTheLook.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Trending in Your Style */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="font-serif text-3xl font-medium">{t("trending.title")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* New Arrivals You'll Love */}
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-medium mb-2">{t("newArrivals.title")}</h2>
              <p className="text-muted-foreground">{t("newArrivals.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-4 bg-secondary text-secondary-foreground rounded-2xl">
            <h2 className="font-serif text-3xl font-medium mb-4">{t("cta.title")}</h2>
            <p className="text-secondary-foreground/80 mb-6 max-w-xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all">
              {t("cta.button")}
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
