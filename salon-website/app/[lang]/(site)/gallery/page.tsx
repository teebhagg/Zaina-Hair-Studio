import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { GalleryHeader } from '@/components/gallery/GalleryHeader'
import { locales, type Locale } from '@/lib/i18n'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { galleryQuery } from '@/lib/sanity/queries'
import { translateCMSArray } from '@/lib/utils/cms-locale'
import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  if (!lang || !hasLocale(lang)) {
    notFound()
  }
  
  const langTyped = lang as Locale
  const hasSanityConfig = isSanityConfigured()
  const gallery = hasSanityConfig
    ? await client.fetch(galleryQuery(langTyped)).catch((error) => {
        console.error('Error fetching gallery:', error)
        return []
      })
    : []

  // Translate CMS content based on locale
  const translatedGallery = translateCMSArray(gallery, langTyped, { logMissing: process.env.NODE_ENV === 'development' })

  return (
    <div className="container mx-auto px-4 py-12">
      <GalleryHeader />
      <GalleryGrid gallery={translatedGallery} />
    </div>
  )
}
