'use client'

import { Instagram, Facebook, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"

export function Footer() {
  const t = useTranslations('footer')
  const siteName = useTranslations()('siteName')
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* Brand */}
          <div className="space-y-5">
            <Image
              src="https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679864/pps_ednzk2.png"
              alt="Prova"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <p className="text-sm text-white/60 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex gap-5">
              <a
                href="https://instagram.com"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Instagram"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Facebook"
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-white/60 hover:text-white transition-colors"
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
            <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-6 text-white">{t('shop')}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/shop?category=women" className="hover:text-white transition-colors">
                  {t('women')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=men" className="hover:text-white transition-colors">
                  {t('men')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-white transition-colors">
                  {t('accessories')}
                </Link>
              </li>
              <li>
                <Link href="/shop?sale=true" className="hover:text-white transition-colors">
                  {t('sale')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-6 text-white">{t('help')}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  {t('customerService')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  {t('shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  {t('returns')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.12em] uppercase mb-6 text-white">{t('stayUpdated')}</h4>
            <p className="text-sm text-white/60 mb-5 leading-relaxed">{t('subscribeText')}</p>
            <form className="flex gap-0">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-4 py-2.5 bg-white/10 text-white border border-white/20 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-white text-[#1a1a1a] text-[11px] font-medium tracking-[0.08em] uppercase hover:bg-white/90 transition-colors"
              >
                {t('joinButton')}
              </button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40"
        >
          <p>{t('copyright', { siteName })}</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('termsOfService')}
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
