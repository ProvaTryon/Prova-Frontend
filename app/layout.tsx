import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, Noto_Sans_Arabic } from "next/font/google"
import { isRTL } from "@/lib/i18n-config"
import { routing } from '@/i18n/routing'
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Add Arabic font
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Pròva (بروفه) - AI-Powered Fashion Platform",
  description:
    "Experience the future of fashion with virtual try-on, smart recommendations, and personalized shopping.",
  generator: 'v0.app'
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      dir={isRTL(locale) ? 'rtl' : 'ltr'}
      className={`${playfair.variable} ${dmSans.variable} ${notoArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
