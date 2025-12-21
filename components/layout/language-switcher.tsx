"use client"

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Languages, Check } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n-config';
import { useState, useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    // Store preference in cookie (more reliable than localStorage)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(() => {
      // Handle URL with or without locale prefix
      let newPath = pathname;

      // Remove existing locale prefix if present
      const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
      newPath = pathname.replace(localePattern, '/');

      // Add new locale prefix only if not default English
      if (newLocale !== 'en') {
        newPath = `/${newLocale}${newPath}`;
      }

      // Navigate to new path
      router.push(newPath);
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-full transition-colors"
        disabled={isPending}
        aria-label="Change language"
      >
        <Languages className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-20">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLanguage(loc)}
                disabled={isPending}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors
                  flex items-center justify-between
                  ${locale === loc ? 'bg-muted font-medium' : ''}
                  ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{localeFlags[loc as Locale]}</span>
                  <span>{localeNames[loc as Locale]}</span>
                </span>
                {locale === loc && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
