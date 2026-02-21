"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowRight, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function NewsletterSection() {
  const t = useTranslations('home')
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="py-24 bg-foreground text-background">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <p className="text-overline text-background/60 mb-4">{t('newsletter.overline')}</p>
        <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">{t('newsletter.title')}</h2>
        <div className="w-12 h-[2px] bg-accent mx-auto mb-6" />
        <p className="text-background/60 mb-10 leading-relaxed">{t('newsletter.description')}</p>

        <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-center justify-center gap-3 text-accent"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">{t('newsletter.success')}</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              required
              className="flex-1 bg-transparent border border-background/30 text-background px-5 py-3.5 text-sm placeholder:text-background/50 focus:outline-none focus:border-background/60 transition-colors duration-300"
            />
            <button
              type="submit"
              className="bg-background text-foreground px-8 py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-accent hover:text-foreground transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {t('newsletter.cta')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.form>
        )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
