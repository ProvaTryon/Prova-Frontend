"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowRight, CheckCircle } from "lucide-react"

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
    <section className="py-24 bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-overline text-muted-foreground mb-4">{t('newsletter.overline')}</p>
        <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">{t('newsletter.title')}</h2>
        <div className="w-12 h-[2px] bg-accent mx-auto mb-6" />
        <p className="text-muted-foreground mb-10 leading-relaxed">{t('newsletter.description')}</p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-accent animate-fade-in-up">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">{t('newsletter.success')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              required
              className="flex-1 bg-transparent border border-border px-5 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors duration-300"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-8 py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-accent hover:text-foreground transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {t('newsletter.cta')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
