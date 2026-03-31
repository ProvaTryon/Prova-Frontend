import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BestSellers } from "@/components/home/best-sellers"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedCollections, CollectionsGrid, TestimonialSection } from "@/components/home/home-sections"
import { DesignerSpotlight } from "@/components/community"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">

        {/* ═══════════════════════════════════════
            HERO — Fashion Magazine Cover
            ═══════════════════════════════════════ */}
        <HeroSection />

        {/* ═══════════════════════════════════════
            FEATURED COLLECTION — 2-Column Editorial
            ═══════════════════════════════════════ */}
        <FeaturedCollections />

        {/* ═══════════════════════════════════════
            DESIGNER SPOTLIGHT — Community Designs
            ═══════════════════════════════════════ */}
        <DesignerSpotlight />

        {/* ═══════════════════════════════════════
            BEST SELLERS — Editorial Grid
            ═══════════════════════════════════════ */}
        <BestSellers />

        {/* ═══════════════════════════════════════
            COLLECTIONS — Curated Grid
            ═══════════════════════════════════════ */}
        <CollectionsGrid />

        {/* ═══════════════════════════════════════
            TESTIMONIAL — Minimal & Elegant
            ═══════════════════════════════════════ */}
        <TestimonialSection />

        {/* ═══════════════════════════════════════
            NEWSLETTER — With Accent Line
            ═══════════════════════════════════════ */}
        <NewsletterSection />

      </main>

      <Footer />
    </div>
  )
}
