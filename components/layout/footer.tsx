'use client'

import { Instagram, Facebook, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export function Footer() {
  const t = useTranslations('footer')
  const siteName = useTranslations()('siteName')

  return (
    <footer className="bg-secondary text-secondary-foreground mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold">{siteName}</h3>
            <p className="text-sm text-secondary-foreground/80">
              {t('description')}
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="hover:text-primary transition-colors"
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
            <h4 className="font-semibold mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>
                <Link href="/shop?category=women" className="hover:text-primary transition-colors">
                  {t('women')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=men" className="hover:text-primary transition-colors">
                  {t('men')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-primary transition-colors">
                  {t('accessories')}
                </Link>
              </li>
              <li>
                <Link href="/shop?sale=true" className="hover:text-primary transition-colors">
                  {t('sale')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4">{t('help')}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  {t('customerService')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary transition-colors">
                  {t('shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary transition-colors">
                  {t('returns')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">{t('stayUpdated')}</h4>
            <p className="text-sm text-secondary-foreground/80 mb-4">{t('subscribeText')}</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-3 py-2 bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t('joinButton')}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
          <p>{t('copyright', { siteName })}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
