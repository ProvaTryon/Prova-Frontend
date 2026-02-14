"use client"

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Languages, Check } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n-config';
import { useState, useTransition, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    // Store preference in cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(() => {
      // Use i18n-aware router to navigate with new locale
      router.replace(pathname, { locale: newLocale as Locale });
      setIsOpen(false);
    });
  };

  return (
    <div className="relative" ref={dropdownRef} data-testid="language-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-full transition-colors"
        disabled={isPending}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="language-switcher-button"
      >
        <Languages className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="absolute end-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50"
          role="menu"
          aria-label="Language selection"
          data-testid="language-menu"
        >
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLanguage(loc)}
              disabled={isPending}
              role="menuitem"
              data-testid={`language-option-${loc}`}
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
      )}
    </div>
  );
}
