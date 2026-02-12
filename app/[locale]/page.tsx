import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { BestSellers } from "@/components/home/best-sellers"

export default function HomePage() {
  const t = useTranslations('home')
  const siteName = useTranslations()('siteName')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Full width image */}
        <section className="relative h-[85vh] overflow-hidden">
          <img
            src="/fashion-model-wearing-elegant-clothing-outdoor-lif.jpg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </section>

        {/* Three Image Grid with Overlay Text */}
        <section className="py-0 -mt-32 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative h-80 overflow-hidden rounded-lg group cursor-pointer">
                <img
                  src="/man-wearing-white-tshirt-and-blue-shorts-casual-su.jpg"
                  alt="Look 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="relative h-80 overflow-hidden rounded-lg group cursor-pointer">
                <img
                  src="/man-wearing-orange-polo-shirt-casual-summer-style.jpg"
                  alt="Look 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-4xl font-serif font-bold mb-2">{t('hero.title')}</p>
                  </div>
                </div>
              </div>
              <div className="relative h-80 overflow-hidden rounded-lg group cursor-pointer">
                <img
                  src="/man-wearing-blue-tshirt-white-pants-summer-casual-.jpg"
                  alt="Look 3"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Brand Banner */}
        <section className="py-16 bg-primary text-primary-foreground mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-2">{t('hero.subtitle')}</h2>
            <p className="text-sm tracking-widest no-flip">{t('hero.established')}</p>
          </div>
        </section>

        {/* Best Sellers Section - Now fetches from backend */}
        <BestSellers />

        {/* Collections Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-medium text-center mb-12">
              {t('collections.title', { siteName })}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collection 1 */}
              <Link href="/shop?category=casual" className="relative h-96 overflow-hidden rounded-lg group">
                <img
                  src="/group-of-friends-wearing-casual-summer-clothing-ou.jpg"
                  alt="Casual Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-serif font-medium mb-2">
                    {t('collections.casual', { siteName })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-foreground" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Collection 2 */}
              <Link href="/shop?category=shirts" className="relative h-96 overflow-hidden rounded-lg group">
                <img
                  src="/man-wearing-white-shirt-back-view-minimal-style.jpg"
                  alt="Shirts Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-serif font-medium mb-2">
                    {t('collections.shirts', { siteName })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-foreground" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Collection 3 */}
              <Link href="/shop?category=pants" className="relative h-96 overflow-hidden rounded-lg group">
                <img
                  src="/man-wearing-jeans-casual-pants-outdoor-lifestyle.jpg"
                  alt="Pants Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-serif font-medium mb-2">
                    {t('collections.pants', { siteName })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-foreground" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Collection 4 */}
              <Link href="/shop?category=formal" className="relative h-96 overflow-hidden rounded-lg group">
                <img
                  src="/man-wearing-white-formal-shirt-elegant-style.jpg"
                  alt="Formal Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-serif font-medium mb-2">
                    {t('collections.formal', { siteName })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-foreground" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Collection 5 */}
              <Link href="/shop?category=shorts" className="relative h-96 overflow-hidden rounded-lg group">
                <img
                  src="/man-wearing-blue-shorts-summer-casual-style.jpg"
                  alt="Shorts Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-serif font-medium mb-2">
                    {t('collections.shorts', { siteName })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-foreground" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Collection 6 - Accessories */}
              <Link href="/shop?category=accessories" className="relative h-96 overflow-hidden rounded-lg group">
                <img
                  src="/luxury-perfume-bottle-golden-elegant-product-photo.jpg"
                  alt="Accessories Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-serif font-medium mb-2">
                    {t('collections.accessories', { siteName })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-foreground" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
