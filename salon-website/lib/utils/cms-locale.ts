/**
 * Simple utility to get localized CMS field value
 * Returns German field if available and locale is German, otherwise returns English field
 * This is NOT a translation service - it just selects the appropriate field from CMS
 * 
 * @deprecated Use `translateField` from '@/lib/utils/cms-translator' for better type safety
 * or use `translateCMSObject` for automatic field translation
 */

type Locale = "en" | "de";

/**
 * Get localized CMS field value
 * If locale is German and German field exists, use it. Otherwise, use English field.
 * 
 * @deprecated Use `translateField` from '@/lib/utils/cms-translator' instead
 */
export function getCMSField(
  englishValue: string | null | undefined,
  germanValue: string | null | undefined,
  locale: Locale
): string {
  if (locale === "de" && germanValue) {
    return germanValue;
  }
  return englishValue || "";
}

// Re-export new utilities for convenience
export {
    getLocalizedField, getTranslationCoverage, hasTranslation, translateCMSArray,
    translateCMSNested, translateCMSObject, translateField
} from "./cms-translator";

