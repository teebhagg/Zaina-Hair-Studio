import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import deTranslations from "../../messages/de.json";
import enTranslations from "../../messages/en.json";

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      de: {
        translation: deTranslations,
      },
    },
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Order and from where user language should be detected
      order: ["path", "localStorage", "navigator"],
      // Keys or params to lookup language from
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      // Cache user language on
      caches: ["localStorage"],
    },
  });

export default i18n;
