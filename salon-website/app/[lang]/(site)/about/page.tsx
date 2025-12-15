import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { locales, type Locale } from '@/lib/i18n'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { aboutQuery, teamQuery } from '@/lib/sanity/queries'
import { translateCMSArray, translateCMSNested } from '@/lib/utils/cms-locale'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export default async function AboutPage({
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
  const [about, team] = await Promise.all([
    hasSanityConfig ? client.fetch(aboutQuery(langTyped)).catch(() => null) : Promise.resolve(null),
    hasSanityConfig ? client.fetch(teamQuery(langTyped)).catch(() => []) : Promise.resolve([]),
  ])

  // Translate CMS content based on locale
  const translatedAbout = about
    ? translateCMSNested(about, langTyped, { logMissing: process.env.NODE_ENV === 'development' })
    : null
  
  const translatedTeam = translateCMSArray(team, langTyped, { logMissing: process.env.NODE_ENV === 'development' })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            {translatedAbout?.heading || dict.about.title}
          </h1>
          {translatedAbout?.mission && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {translatedAbout.mission}
            </p>
          )}
        </div>

        {translatedAbout?.image && (
          <div className="relative h-96 overflow-hidden">
            <Image
              src={translatedAbout.image}
              alt="About"
              fill
              className="object-cover"
            />
          </div>
        )}

        {translatedAbout?.content && (
          <div className="prose prose-invert max-w-none">
            <PortableText value={translatedAbout.content} />
          </div>
        )}

        {/* Values */}
        {translatedAbout?.values && translatedAbout.values.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">{dict.about.values}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {translatedAbout.values.map((value: any, idx: number) => (
                <Card key={idx}>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {translatedTeam.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">{dict.about.team}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {translatedTeam.map((member: any) => (
                <Card key={member._id}>
                  {member.image && (
                    <div className="relative h-64 w-full">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                    )}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">
                          {dict.about.specialties}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((spec: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/20 text-primary px-2 py-1"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
