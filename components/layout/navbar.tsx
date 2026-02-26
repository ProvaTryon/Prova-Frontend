"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Search, ShoppingBag, Heart, User, LogOut, Shield, Store, Headphones } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useAuth } from "@/lib/auth-context"
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'
import { SearchModal } from './search-modal'
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const { wishlistItems } = useWishlist()
  const { user, logout, isAuthenticated, isAdmin, isStoreOwner, isCustomerService } = useAuth()
  const t = useTranslations('nav')
  const siteName = useTranslations()('siteName')
  const { resolvedTheme } = useTheme()

  const logoSrc = resolvedTheme === 'dark'
    ? 'https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679864/pps_ednzk2.png'
    : 'https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679326/Picture2_uyt4oe.png'

  // Track scroll position for navbar shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-b transition-shadow duration-300 ${scrolled ? "border-border shadow-sm" : "border-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center"
            >
              <Image
                src={logoSrc}
                alt="Prova"
                width={100}
                height={36}
                className="h-9 w-auto object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/", label: t('home') },
              { href: "/shop", label: t('shop') },
              { href: "/virtual-tryon", label: t('virtualTryon') },
              { href: "/recommendations", label: t('forYou') },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[13px] font-medium tracking-[0.04em] uppercase hover:text-muted-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-accent group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setSearchOpen(true)}
              className="hidden md:block p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={t('search')}
              title={t('search')}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <Link href="/wishlist" className="relative p-2 hover:bg-muted rounded-lg transition-colors group">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Heart className="w-5 h-5" />
              </motion.div>
              <AnimatePresence>
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-foreground text-background text-[10px] font-medium flex items-center justify-center rounded-full"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors group">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <ShoppingBag className="w-5 h-5" />
              </motion.div>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-foreground text-background text-[10px] font-medium flex items-center justify-center rounded-full"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label={t('userMenu')}
                  title={t('userMenu')}
                  {...(userMenuOpen && { 'aria-expanded': true })}
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <button
                        className="fixed inset-0 z-10 cursor-default bg-transparent border-0"
                        onClick={() => setUserMenuOpen(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setUserMenuOpen(false)
                        }}
                        aria-label={t('closeMenu')}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute end-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl py-2 z-20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-primary font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Shield className="w-4 h-4" />
                            {t('adminDashboard')}
                          </Link>
                        )}
                        {isStoreOwner && (
                          <Link
                            href="/store-owner"
                            className="px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-primary font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Store className="w-4 h-4" />
                            {t('storeDashboard')}
                          </Link>
                        )}
                        {isCustomerService && (
                          <Link
                            href="/customer-service"
                            className="px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-primary font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Headphones className="w-4 h-4" />
                            {t('csDashboard')}
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {t('profile')}
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {t('orders')}
                        </Link>
                        <Link
                          href="/profile?tab=wishlist"
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {t('wishlist')}
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
                <Link
                  href="/auth"
                  className="block px-5 py-2.5 bg-foreground text-background text-[12px] font-medium tracking-[0.08em] uppercase hover:bg-foreground/90 transition-colors rounded-lg"
                >
                  {t('login')}
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 py-4 space-y-1"
            >
              {/* Theme and Language controls */}
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-border">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              {[
                { href: "/", label: t('home') },
                { href: "/shop", label: t('shop') },
                { href: "/virtual-tryon", label: t('virtualTryon') },
                { href: "/recommendations", label: t('forYou') },
              ].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="block py-2.5 text-[13px] font-medium tracking-[0.04em] uppercase hover:text-muted-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated ? (
                <>
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                    <Link
                      href="/profile"
                      className="block py-2.5 text-[13px] font-medium tracking-[0.04em] uppercase hover:text-muted-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('profile')}
                    </Link>
                  </motion.div>
                  {isAdmin && (
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.3 }}>
                      <Link
                        href="/admin"
                        className="py-2.5 text-[13px] font-medium text-primary flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        {t('adminDashboard')}
                      </Link>
                    </motion.div>
                  )}
                  {isStoreOwner && (
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                      <Link
                        href="/store-owner"
                        className="py-2.5 text-[13px] font-medium text-primary flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Store className="w-5 h-5" />
                        {t('storeDashboard')}
                      </Link>
                    </motion.div>
                  )}
                  {isCustomerService && (
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.3 }}>
                      <Link
                        href="/customer-service"
                        className="py-2.5 text-[13px] font-medium text-primary flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Headphones className="w-5 h-5" />
                        {t('csDashboard')}
                      </Link>
                    </motion.div>
                  )}
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.3 }}>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left py-2.5 text-[13px] font-medium text-destructive"
                    >
                      {t('logout')}
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                  <Link
                    href="/auth"
                    className="block py-2.5 text-[13px] font-medium tracking-[0.04em] uppercase hover:text-muted-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.nav>
  )
}
