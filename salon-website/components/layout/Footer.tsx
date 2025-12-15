'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Instagram, Facebook, Mail, Phone, Twitter, Youtube, Linkedin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'

interface SiteSettings {
  phone?: string
  email?: string
  instagram?: string
  facebook?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
}

interface FooterProps {
  siteSettings?: SiteSettings | null
}

export function Footer({ siteSettings }: FooterProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">
              Zainab&apos;s Salon
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('nav.footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('nav.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/services`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/gallery`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/reviews`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.reviews')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">{t('contact.title')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {siteSettings?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{siteSettings.phone}</span>
                </li>
              )}
              {siteSettings?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{siteSettings.email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-semibold mb-4">{t('nav.bookCTA')}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('nav.bookCTADescription')}
            </p>
            <Button asChild>
              <Link href={`/${locale}/book`}>{t('nav.book')}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zainab&apos;s Salon. {t('nav.allRightsReserved')}
          </p>
          <div className="flex gap-4">
            {siteSettings?.instagram && (
              <Link
                href={siteSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            )}
            {siteSettings?.facebook && (
              <Link
                href={siteSettings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            )}
            {siteSettings?.twitter && (
              <Link
                href={siteSettings.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            )}
            {siteSettings?.youtube && (
              <Link
                href={siteSettings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            )}
            {siteSettings?.linkedin && (
              <Link
                href={siteSettings.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )}
            {siteSettings?.tiktok && (
              <Link
                href={siteSettings.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
