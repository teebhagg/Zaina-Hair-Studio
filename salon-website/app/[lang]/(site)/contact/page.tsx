import { MapEmbed } from '@/components/contact/MapEmbed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '@/lib/i18n'
import { client } from '@/lib/sanity/client'
import { siteSettingsQuery } from '@/lib/sanity/queries'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

async function getSiteSettings() {
  try {
    const settings = await client.fetch(siteSettingsQuery())
    return settings || null
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  if (!lang || !hasLocale(lang)) {
    notFound()
  }
  
  const dict = await getDictionary(lang)
  const settings = await getSiteSettings()

  // Get address from settings (auto-filled from location)
  const fullAddress = settings?.address || '123 Beauty Street, New York, NY 10001'

  // Format business hours
  const formatHours = () => {
    if (!settings?.businessHours || settings.businessHours.length === 0) {
      return (
        <>
          Monday - Friday: 9:00 AM - 7:00 PM
          <br />
          Saturday: 10:00 AM - 6:00 PM
          <br />
          Sunday: Closed
        </>
      )
    }

    const dayLabels: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    }

    return (
      <>
        {settings.businessHours.map((day: any, idx: number) => (
          <span key={idx}>
            {dayLabels[day.day] || day.day}: {day.hours || 'Closed'}
            {idx < settings.businessHours.length - 1 && <br />}
          </span>
        ))}
      </>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">{dict.contact.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {dict.contact.subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dict.contact.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">{dict.contact.address}</p>
                  <p className="text-muted-foreground">{fullAddress}</p>
                </div>
              </div>

              {settings?.phone && (
                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">{dict.contact.phone}</p>
                    <p className="text-muted-foreground">{settings.phone}</p>
                  </div>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">{dict.contact.email}</p>
                    <p className="text-muted-foreground">{settings.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">{dict.contact.hours}</p>
                  <p className="text-muted-foreground">{formatHours()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div>
          <MapEmbed 
            embedUrl={settings?.googleMapsEmbedUrl} 
            location={settings?.location}
          />
        </div>
      </div>
    </div>
  )
}
