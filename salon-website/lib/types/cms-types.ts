import type { Locale } from "@/lib/i18n";

/**
 * Represents a field that can have translations in multiple languages
 */
export type TranslatableField<T = string> = {
  en: T;
  de?: T;
  // Add more languages here as needed
  // fr?: T;
  // es?: T;
};

/**
 * Mapping of locale codes to field suffixes used in CMS
 */
export const LOCALE_FIELD_SUFFIX: Record<Locale, string> = {
  en: "",
  de: "_de",
};

/**
 * Helper type to extract translatable field names from an object
 * For example, if object has { name: string, name_de: string }, this extracts "name"
 */
export type TranslatableFieldName<T> = {
  [K in keyof T]: K extends `${infer Base}_de`
    ? Base
    : K extends `${infer Base}_fr`
    ? Base
    : never;
}[keyof T];

/**
 * Configuration for translation behavior
 */
export interface TranslationConfig {
  locale?: Locale; // Optional - will be inferred from function parameters
  logMissing?: boolean; // Log missing translations in development
  fallbackLocale?: Locale; // Fallback locale (default: 'en')
}

/**
 * Result of a translation operation with metadata
 */
export interface TranslationResult<T> {
  value: T;
  locale: Locale;
  isFallback: boolean; // True if fallback locale was used
}
