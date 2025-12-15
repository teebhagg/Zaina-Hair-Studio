import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { NextRequest } from 'next/server'

export const locales = ['en', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function getLocale(request: NextRequest): Locale {
  // Get Accept-Language header from request
  const acceptLanguage = request.headers.get('accept-language') || 'en'
  
  const headersObj = { 'accept-language': acceptLanguage }
  const languages = new Negotiator({ headers: headersObj }).languages()
  
  return match(languages, Array.from(locales), defaultLocale) as Locale
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
