import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
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

  // Use images array if available, otherwise fall back to single image
  const serviceImages = translatedService.images && translatedService.images.length > 0
    ? translatedService.images
    : translatedService.image
      ? [translatedService.image]
      : []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        {serviceImages.length > 0 && (
          <div className="relative min-h-96 md:min-h-[800px] w-full">
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full ml-0">
                {serviceImages.map((img: string, index: number) => (
                  <CarouselItem key={index} className="pl-0 basis-full" style={{ height: '100%' }}>
                    <div className="relative w-full overflow-hidden min-h-96 md:min-h-[800px]" style={{ height: '100%' }}>
                      <Image
                        src={img}
                        alt={`${translatedService.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {serviceImages.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">{translatedService.name}</h1>
          <p className="text-lg text-muted-foreground">{translatedService.description}</p>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    ${translatedService.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-lg">
                    {translatedService.duration} {dict.services.minutes}
                  </span>
                </div>
              </div>

              {translatedService.extras &&
                Array.isArray(translatedService.extras) &&
                translatedService.extras.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Optional extras
                    </h2>
                    <ul className="space-y-2">
                      {translatedService.extras.map((extra: any) => (
                        <li
                          key={extra.name}
                          className="flex items-start justify-between rounded-md border border-zinc-800 px-3 py-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{extra.name}</p>
                            {extra.description && (
                              <p className="text-xs text-muted-foreground">
                                {extra.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {typeof extra.price === 'number' && (
                              <p>+ ${extra.price.toFixed(2)}</p>
                            )}
                            {extra.duration && (
                              <p>+ {extra.duration} {dict.services.minutes}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
