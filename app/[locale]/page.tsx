import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, ChevronDown, Play, Sparkles, Quote } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { BestSellers } from "@/components/home/best-sellers"
import { NewsletterSection } from "@/components/home/newsletter-section"
import Image from "next/image"

export default function HomePage() {
  const t = useTranslations('home')
  const siteName = useTranslations()('siteName')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">

        {/* ═══════════════════════════════════════
            HERO — Fashion Magazine Cover
            ═══════════════════════════════════════ */}
        <section className="relative h-screen overflow-hidden">
          <Image
            src="/fashion-model-wearing-elegant-clothing-outdoor-lif.jpg"
            alt="Hero"
            fill
            priority
            className="object-cover scale-105 animate-hero-zoom"
            sizes="100vw"
          />
          {/* Dark cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Hero content — editorial typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 animate-fade-in-up">
            <p className="text-overline text-white/70 mb-6 tracking-[0.25em]">
              {t('hero.overline')}
            </p>
            <h1 className="font-serif text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-[-0.03em] max-w-4xl mb-6">
              {t('hero.headline')}
            </h1>
            {/* Accent underline */}
            <div className="w-16 h-[2px] bg-accent mb-6" />
            <p className="text-lg md:text-xl text-white/80 font-light max-w-lg mb-10 leading-relaxed">
              {t('hero.subheadline')}
            </p>
            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="bg-white text-black px-10 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors duration-300"
              >
                {t('hero.ctaPrimary')}
              </Link>
              <Link
                href="/virtual-tryon"
                className="border border-white/50 text-white px-10 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase hover:border-accent hover:text-accent transition-colors duration-300"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
            <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase">{t('hero.scroll')}</span>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURED COLLECTION — 2-Column Editorial
            ═══════════════════════════════════════ */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header with accent underline */}
            <div className="text-center mb-16 animate-fade-in-up">
              <p className="text-overline text-muted-foreground mb-4">{t('featured.overline')}</p>
              <h2 className="text-headline">{t('featured.title')}</h2>
              <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured 1 — Large editorial card */}
              <Link href="/shop?category=casual" className="relative aspect-[3/4] overflow-hidden group">
                <Image
                  src="/group-of-friends-wearing-casual-summer-clothing-ou.jpg"
                  alt="Casual Collection"
                  fill
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 start-8 end-8">
                  <p className="text-overline text-white/70 mb-2">{t('featured.label')}</p>
                  <h3 className="text-3xl md:text-4xl font-serif font-light text-white mb-4">
                    {t('collections.casual', { siteName })}
                  </h3>
                  <div className="flex items-center gap-3 text-white/80 group-hover:text-accent transition-colors duration-300">
                    <span className="text-[11px] font-medium tracking-[0.15em] uppercase">{t('featured.explore')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Featured 2 */}
              <Link href="/shop?category=formal" className="relative aspect-[3/4] overflow-hidden group">
                <Image
                  src="/man-wearing-white-formal-shirt-elegant-style.jpg"
                  alt="Formal Collection"
                  fill
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 start-8 end-8">
                  <p className="text-overline text-white/70 mb-2">{t('featured.label')}</p>
                  <h3 className="text-3xl md:text-4xl font-serif font-light text-white mb-4">
                    {t('collections.formal', { siteName })}
                  </h3>
                  <div className="flex items-center gap-3 text-white/80 group-hover:text-accent transition-colors duration-300">
                    <span className="text-[11px] font-medium tracking-[0.15em] uppercase">{t('featured.explore')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BEST SELLERS — Editorial Grid
            ═══════════════════════════════════════ */}
        <BestSellers />

        {/* ═══════════════════════════════════════
            VIRTUAL TRY-ON — Dark Cinematic Block
            ═══════════════════════════════════════ */}
        <section className="relative py-32 bg-foreground text-background overflow-hidden">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/fashion-model-wearing-elegant-clothing-outdoor-lif.jpg"
              alt=""
              fill
              className="object-cover blur-2xl"
              sizes="100vw"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <p className="text-overline text-background/50">{t('tryon.overline')}</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-light leading-tight mb-6">
                  {t('tryon.title')}
                </h2>
                <div className="w-12 h-[2px] bg-accent mb-6" />
                <p className="text-background/60 text-lg leading-relaxed mb-10 max-w-md">
                  {t('tryon.description')}
                </p>
                <Link
                  href="/virtual-tryon"
                  className="inline-flex items-center gap-3 bg-accent text-foreground px-8 py-4 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors duration-300"
                >
                  <Play className="w-4 h-4" />
                  {t('tryon.cta')}
                </Link>
              </div>

              {/* Preview images */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src="/man-wearing-white-tshirt-and-blue-shorts-casual-su.jpg"
                      alt="Try-On Before"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute bottom-3 start-3">
                      <span className="text-[10px] font-medium tracking-[0.15em] uppercase bg-black/60 text-white px-3 py-1">
                        {t('tryon.before')}
                      </span>
                    </div>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src="/man-wearing-orange-polo-shirt-casual-summer-style.jpg"
                      alt="Try-On After"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute bottom-3 start-3">
                      <span className="text-[10px] font-medium tracking-[0.15em] uppercase bg-accent text-foreground px-3 py-1">
                        {t('tryon.after')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            COLLECTIONS — Curated Grid
            ═══════════════════════════════════════ */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-overline text-muted-foreground mb-4">{t('collections.overline')}</p>
              <h2 className="text-headline">{t('collections.title', { siteName })}</h2>
              <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { href: "/shop?category=shirts", img: "/man-wearing-white-shirt-back-view-minimal-style.jpg", label: t('collections.shirts', { siteName }) },
                { href: "/shop?category=pants", img: "/man-wearing-jeans-casual-pants-outdoor-lifestyle.jpg", label: t('collections.pants', { siteName }) },
                { href: "/shop?category=shorts", img: "/man-wearing-blue-shorts-summer-casual-style.jpg", label: t('collections.shorts', { siteName }) },
                { href: "/shop?category=accessories", img: "/luxury-perfume-bottle-golden-elegant-product-photo.jpg", label: t('collections.accessories', { siteName }) },
              ].map((col) => (
                <Link key={col.href} href={col.href} className="relative aspect-[3/4] overflow-hidden group">
                  <Image
                    src={col.img}
                    alt={col.label}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 start-6 end-6">
                    <h3 className="text-xl font-serif font-light text-white mb-2">{col.label}</h3>
                    <div className="flex items-center gap-2 text-white/70 group-hover:text-accent transition-colors duration-300">
                      <span className="text-[10px] font-medium tracking-[0.15em] uppercase">{t('featured.explore')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TESTIMONIAL — Minimal & Elegant
            ═══════════════════════════════════════ */}
        <section className="py-24 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Quote className="w-8 h-8 text-accent mx-auto mb-8" />
            <blockquote className="text-2xl md:text-3xl font-serif font-light leading-relaxed text-foreground/90 mb-8">
              &ldquo;{t('testimonial.quote')}&rdquo;
            </blockquote>
            <div className="w-8 h-[2px] bg-accent mx-auto mb-4" />
            <p className="text-overline text-muted-foreground">{t('testimonial.author')}</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            NEWSLETTER — With Accent Line
            ═══════════════════════════════════════ */}
        <NewsletterSection />

      </main>

      <Footer />
    </div>
  )
}
