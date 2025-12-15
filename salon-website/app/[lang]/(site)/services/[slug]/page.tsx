import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { locales, type Locale } from '@/lib/i18n'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { serviceBySlugQuery, servicesQuery } from '@/lib/sanity/queries'
import { translateCMSObject } from '@/lib/utils/cms-locale'
import { Clock, DollarSign } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../../dictionaries'

export async function generateStaticParams() {
  const hasSanityConfig = isSanityConfigured()
  if (!hasSanityConfig) {
    return []
  }
  const services = await client.fetch(servicesQuery('en')).catch(() => [])
  return locales.flatMap((locale) =>
    services.map((service: any) => ({
      slug: service.slug.current,
      lang: locale,
    }))
  )
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>
}) {
  const { slug, lang } = await params
  
  if (!lang || !hasLocale(lang)) {
    notFound()
  }
  
  const dict = await getDictionary(lang)
  const langTyped = lang as Locale
  const hasSanityConfig = isSanityConfigured()
  const service = hasSanityConfig && slug
    ? await client.fetch(serviceBySlugQuery(langTyped), { slug }).catch(() => null)
    : null

  if (!service) {
    notFound()
  }

  // Translate CMS content based on locale
  const translatedService = translateCMSObject(service, langTyped, { logMissing: process.env.NODE_ENV === 'development' })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <Image
            src={translatedService.image}
            alt={translatedService.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">{translatedService.name}</h1>
          <p className="text-lg text-muted-foreground">{translatedService.description}</p>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">${translatedService.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-lg">{translatedService.duration} {dict.services.minutes}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button asChild size="lg" className="w-full">
            <Link href={`/${lang}/book?service=${slug}`}>{dict.services.bookService}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
