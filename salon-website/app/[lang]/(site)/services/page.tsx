import { ServiceCard } from '@/components/services/ServiceCard'
import { Skeleton } from '@/components/ui/skeleton'
import { locales, type Locale } from '@/lib/i18n'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { servicesQuery } from '@/lib/sanity/queries'
import { translateCMSArray } from '@/lib/utils/cms-locale'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  if (!lang || !hasLocale(lang)) {
    notFound()
  }
  
  const dict = await getDictionary(lang)
  const langTyped = lang as Locale
  const hasSanityConfig = isSanityConfigured()
  const services = hasSanityConfig 
    ? await client.fetch(servicesQuery(langTyped)).catch(() => [])
    : []

  // Translate CMS content based on locale
  const translatedServices = translateCMSArray(services, langTyped, { logMissing: process.env.NODE_ENV === 'development' })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">{dict.services.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {dict.services.subtitle}
        </p>
      </div>

      {translatedServices.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {translatedServices.map((service: any) => (
            <ServiceCard key={service._id} {...service} />
          ))}
        </div>
      )}
    </div>
  )
}
