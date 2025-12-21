/**
 * RTL (Right-to-Left) Utility Functions
 * Helper functions for handling bidirectional content and layout
 */

/**
 * Returns the appropriate class based on the current locale direction
 * @param ltr - Class name for LTR languages
 * @param rtl - Class name for RTL languages
 * @param locale - Current locale
 * @returns Appropriate class name
 */
export function getDirectionalClass(
  ltr: string,
  rtl: string,
  locale: string
): string {
  const rtlLocales = ['ar', 'he', 'fa', 'ur']; // Add more RTL locales as needed
  return rtlLocales.includes(locale) ? rtl : ltr;
}

/**
 * Returns the appropriate value based on the current locale direction
 * @param ltr - Value for LTR languages
 * @param rtl - Value for RTL languages
 * @param locale - Current locale
 * @returns Appropriate value
 */
export function getDirectionalValue<T>(ltr: T, rtl: T, locale: string): T {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? rtl : ltr;
}

/**
 * Formats a number according to the locale
 * @param num - Number to format
 * @param locale - Current locale
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats a date according to the locale
 * @param date - Date to format
 * @param locale - Current locale
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Formats currency according to the locale
 * @param amount - Amount to format
 * @param locale - Current locale
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Gets the text direction for a given locale
 * @param locale - Current locale
 * @returns 'rtl' or 'ltr'
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Checks if a locale is RTL
 * @param locale - Current locale
 * @returns true if RTL, false otherwise
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale);
}

/**
 * Gets directional margin/padding class names
 * @param side - 'start' or 'end'
 * @param value - Tailwind spacing value (e.g., '4', 'auto')
 * @returns Class name that works in both LTR and RTL
 */
export function getDirectionalSpacing(
  side: 'start' | 'end',
  value: string,
  type: 'm' | 'p' = 'm'
): string {
  // Using logical properties
  if (side === 'start') {
    return type === 'm' ? `ms-${value}` : `ps-${value}`;
  }
  return type === 'm' ? `me-${value}` : `pe-${value}`;
}

/**
 * Flips a numeric value for RTL (useful for animations, positions)
 * @param value - Value to potentially flip
 * @param locale - Current locale
 * @returns Flipped value if RTL, original if LTR
 */
export function flipValueForRTL(value: number, locale: string): number {
  return isRTLLocale(locale) ? -value : value;
}

/**
 * Gets the appropriate text alignment class
 * @param align - 'left', 'right', or 'center'
 * @param locale - Current locale
 * @returns Class name that works in both LTR and RTL
 */
export function getTextAlignClass(
  align: 'left' | 'right' | 'center',
  locale: string
): string {
  if (align === 'center') return 'text-center';

  const isRTL = isRTLLocale(locale);

  if (align === 'left') {
    return isRTL ? 'text-right' : 'text-left';
  }

  return isRTL ? 'text-left' : 'text-right';
}

/**
 * Gets flex direction class for RTL support
 * @param direction - 'row' or 'row-reverse'
 * @param locale - Current locale
 * @returns Class name that flips in RTL
 */
export function getFlexDirectionClass(
  direction: 'row' | 'row-reverse',
  locale: string
): string {
  const isRTL = isRTLLocale(locale);

  if (direction === 'row') {
    return isRTL ? 'flex-row-reverse' : 'flex-row';
  }

  return isRTL ? 'flex-row' : 'flex-row-reverse';
}
