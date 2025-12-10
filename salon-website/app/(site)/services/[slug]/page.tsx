import { client, isSanityConfigured } from '@/lib/sanity/client'
import { serviceBySlugQuery, servicesQuery } from '@/lib/sanity/queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, DollarSign } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const hasSanityConfig = isSanityConfigured()
  if (!hasSanityConfig) return []
  const services = await client.fetch(servicesQuery).catch(() => [])
  return services.map((service: any) => ({
    slug: service.slug.current,
  }))
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const hasSanityConfig = isSanityConfigured()
  const service = hasSanityConfig
    ? await client.fetch(serviceBySlugQuery, { slug }).catch(() => null)
    : null

  if (!service) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">{service.name}</h1>
          <p className="text-lg text-muted-foreground">{service.description}</p>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">${service.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-lg">{service.duration} minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button asChild size="lg" className="w-full">
            <Link href={`/book?service=${slug}`}>Book This Service</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

