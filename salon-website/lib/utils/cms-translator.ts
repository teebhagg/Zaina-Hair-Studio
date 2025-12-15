import type { Locale } from "@/lib/i18n";
import type { TranslationConfig, TranslationResult } from "@/lib/types/cms-types";
import { LOCALE_FIELD_SUFFIX } from "@/lib/types/cms-types";

/**
 * Enhanced field translation with metadata
 * Returns the localized value along with information about whether fallback was used
 */
export function getLocalizedField<T = string>(
  baseValue: T | null | undefined,
  localizedValue: T | null | undefined,
  locale: Locale,
  options?: { logMissing?: boolean }
): TranslationResult<T | string> {
  const isFallback = locale !== "en" && !localizedValue;
  
  // Log missing translations in development
  if (isFallback && options?.logMissing && process.env.NODE_ENV === "development") {
    console.warn(
      `[i18n] Missing translation for locale "${locale}". Falling back to English.`,
      { baseValue }
    );
  }

  return {
    value: (locale !== "en" && localizedValue) ? localizedValue : (baseValue || ""),
    locale: isFallback ? "en" : locale,
    isFallback,
  };
}

/**
 * Simple field translation (backward compatible with getCMSField)
 * Returns just the value without metadata
 */
export function translateField<T = string>(
  baseValue: T | null | undefined,
  localizedValue: T | null | undefined,
  locale: Locale
): T | string {
  if (locale !== "en" && localizedValue) {
    return localizedValue;
  }
  return baseValue || "";
}

/**
 * Automatically translates all fields in a CMS object
 * Looks for fields with locale suffixes (e.g., name_de) and creates localized versions
 */
export function translateCMSObject<T extends Record<string, any>>(
  obj: T,
  locale: Locale,
  config?: TranslationConfig
): T {
  if (!obj || locale === "en") {
    return obj;
  }

  const suffix = LOCALE_FIELD_SUFFIX[locale];
  const translated = { ...obj } as T;

  // Find all base fields that have localized versions
  const baseFields = Object.keys(obj).filter((key) => {
    const localizedKey = `${key}${suffix}`;
    return localizedKey in obj && !key.endsWith(suffix);
  });

  // Translate each field
  baseFields.forEach((baseField) => {
    const localizedKey = `${baseField}${suffix}`;
    const baseValue = obj[baseField];
    const localizedValue = obj[localizedKey];

    if (config?.logMissing && !localizedValue && process.env.NODE_ENV === "development") {
      console.warn(
        `[i18n] Missing translation for field "${baseField}" in locale "${locale}"`,
        { object: obj }
      );
    }

    // Replace base field with localized value if it exists
    (translated as any)[baseField] = localizedValue || baseValue;
  });

  return translated;
}

/**
 * Translates an array of CMS objects
 */
export function translateCMSArray<T extends Record<string, any>>(
  array: T[],
  locale: Locale,
  config?: TranslationConfig
): T[] {
  if (!array || locale === "en") {
    return array;
  }

  return array.map((item) => translateCMSObject(item, locale, config));
}

/**
 * Translates nested objects (e.g., homepage with nested services and gallery)
 * Handles arrays and nested objects recursively
 */
export function translateCMSNested<T extends Record<string, any>>(
  obj: T,
  locale: Locale,
  config?: TranslationConfig
): T {
  if (!obj || locale === "en") {
    return obj;
  }

  // First translate the top-level object
  const translated = translateCMSObject(obj, locale, config);

  // Then handle nested arrays and objects
  Object.keys(translated).forEach((key) => {
    const value = translated[key];

    // Handle arrays
    if (Array.isArray(value)) {
      (translated as any)[key] = value.map((item) => {
        if (typeof item === "object" && item !== null) {
          return translateCMSObject(item, locale, config);
        }
        return item;
      });
    }
    // Handle nested objects (but not null)
    else if (typeof value === "object" && value !== null && !key.startsWith("_")) {
      (translated as any)[key] = translateCMSObject(value, locale, config);
    }
  });

  return translated;
}

/**
 * Helper to check if a translation exists for a specific field
 */
export function hasTranslation(
  obj: Record<string, any>,
  fieldName: string,
  locale: Locale
): boolean {
  if (locale === "en") return true;
  
  const suffix = LOCALE_FIELD_SUFFIX[locale];
  const localizedKey = `${fieldName}${suffix}`;
  
  return localizedKey in obj && !!obj[localizedKey];
}

/**
 * Get translation coverage for an object (useful for content auditing)
 */
export function getTranslationCoverage(
  obj: Record<string, any>,
  locale: Locale
): { total: number; translated: number; percentage: number; missing: string[] } {
  if (locale === "en") {
    return { total: 0, translated: 0, percentage: 100, missing: [] };
  }

  const suffix = LOCALE_FIELD_SUFFIX[locale];
  const baseFields = Object.keys(obj).filter((key) => {
    const localizedKey = `${key}${suffix}`;
    return localizedKey in obj && !key.endsWith(suffix);
  });

  const total = baseFields.length;
  const missing = baseFields.filter((field) => !hasTranslation(obj, field, locale));
  const translated = total - missing.length;
  const percentage = total > 0 ? Math.round((translated / total) * 100) : 100;

  return { total, translated, percentage, missing };
}
