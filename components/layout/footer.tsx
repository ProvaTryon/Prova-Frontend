'use client'

import { Instagram, Facebook, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export function Footer() {
  const t = useTranslations('footer')
  const siteName = useTranslations()('siteName')

  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <h3 className="font-serif text-2xl font-semibold">{siteName}</h3>
            <p className="text-sm text-background/60 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex gap-5">
              <a
                href="https://instagram.com"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Instagram"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Facebook"
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Twitter"
                title="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <X className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-6">{t('shop')}</h4>
            <ul className="space-y-3 text-sm text-background/60">
              <li>
                <Link href="/shop?category=women" className="hover:text-background transition-colors">
                  {t('women')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=men" className="hover:text-background transition-colors">
                  {t('men')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-background transition-colors">
                  {t('accessories')}
                </Link>
              </li>
              <li>
                <Link href="/shop?sale=true" className="hover:text-background transition-colors">
                  {t('sale')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-6">{t('help')}</h4>
            <ul className="space-y-3 text-sm text-background/60">
              <li>
                <Link href="/help" className="hover:text-background transition-colors">
                  {t('customerService')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-background transition-colors">
                  {t('shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-background transition-colors">
                  {t('returns')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-background transition-colors">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-6">{t('stayUpdated')}</h4>
            <p className="text-sm text-background/60 mb-5 leading-relaxed">{t('subscribeText')}</p>
            <form className="flex gap-0">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-4 py-2.5 bg-background/10 text-background border border-background/20 text-sm placeholder:text-background/40 focus:outline-none focus:border-background/50"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-background text-foreground text-[11px] font-medium tracking-[0.08em] uppercase hover:bg-background/90 transition-colors"
              >
                {t('joinButton')}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-background/40">
          <p>{t('copyright', { siteName })}</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-background transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-background transition-colors">
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
