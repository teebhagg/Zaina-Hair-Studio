import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { defaultLocale, type Locale } from '@/lib/i18n'

export default async function NotFound({
  params,
}: {
  params?: Promise<{ lang?: string }>
}) {
  let lang: Locale = defaultLocale
  
  if (params) {
    try {
      const resolvedParams = await params
      const paramLang = resolvedParams?.lang
      if (paramLang === 'en' || paramLang === 'de') {
        lang = paramLang
      }
    } catch {
      lang = defaultLocale
    }
  }

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href={`/${lang}`}>Go Home</Link>
      </Button>
    </div>
  )
}
