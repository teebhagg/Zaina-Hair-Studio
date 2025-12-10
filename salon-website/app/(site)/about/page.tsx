import { client, isSanityConfigured } from '@/lib/sanity/client'
import { aboutQuery, teamQuery } from '@/lib/sanity/queries'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'

export default async function AboutPage() {
  const hasSanityConfig = isSanityConfigured()
  const [about, team] = await Promise.all([
    hasSanityConfig ? client.fetch(aboutQuery).catch(() => null) : Promise.resolve(null),
    hasSanityConfig ? client.fetch(teamQuery).catch(() => []) : Promise.resolve([]),
  ])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            {about?.heading || 'About Us'}
          </h1>
          {about?.mission && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {about.mission}
            </p>
          )}
        </div>

        {about?.image && (
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <Image
              src={about.image}
              alt="About"
              fill
              className="object-cover"
            />
          </div>
        )}

        {about?.content && (
          <div className="prose prose-invert max-w-none">
            <PortableText value={about.content} />
          </div>
        )}

        {/* Values */}
        {about?.values && about.values.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {about.values.map((value: any, idx: number) => (
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
        {team.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Our Team</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {team.map((member: any) => (
                <Card key={member._id}>
                  {member.image && (
                    <div className="relative h-64 w-full">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover rounded-t-2xl"
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
                          Specialties:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((spec: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md"
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

