import { client, isSanityConfigured } from '@/lib/sanity/client'
import { servicesQuery } from '@/lib/sanity/queries'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ServicesPage() {
  const hasSanityConfig = isSanityConfigured()
  const services = hasSanityConfig 
    ? await client.fetch(servicesQuery).catch(() => [])
    : []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover our comprehensive range of beauty and wellness services
        </p>
      </div>

      {services.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service: any) => (
            <ServiceCard key={service._id} {...service} />
          ))}
        </div>
      )}
    </div>
  )
}

