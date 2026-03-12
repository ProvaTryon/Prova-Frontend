"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

export function HeroSection() {
  const t = useTranslations('home')

  return (
    <section className="relative h-screen overflow-hidden">
      <Image
        src="https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148303/pexels-lum3n-44775-322207_fwt4dw.jpg"
        alt="Hero"
        fill
        priority
        className="object-cover scale-105 animate-hero-zoom"
        sizes="100vw"
      />
      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      {/* Hero content — editorial typography */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-overline text-white/70 mb-6 tracking-[0.25em]"
        >
          {t('hero.overline')}
        </motion.p>
        <TextGenerateEffect
          words={t('hero.headline')}
          className="font-serif text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-[-0.03em] max-w-4xl mb-6"
          duration={1.5}
        />
        {/* Accent underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-[2px] bg-accent mb-6 origin-center"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-white/80 font-light max-w-lg mb-10 leading-relaxed"
        >
          {t('hero.subheadline')}
        </motion.p>
        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/shop"
              className="block bg-white text-black px-10 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors duration-300"
            >
              {t('hero.ctaPrimary')}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow"
      >
        <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase">{t('hero.scroll')}</span>
        <ChevronDown className="w-4 h-4 text-white/50" />
      </motion.div>
    </section>
  )
}
