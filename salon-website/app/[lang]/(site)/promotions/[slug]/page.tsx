import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/lib/i18n";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { promotionBySlugQuery } from "@/lib/sanity/queries";
import { translateCMSNested } from "@/lib/utils/cms-locale";
import { Calendar, CheckCircle2, Clock, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../../dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!lang || !hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const localeTyped = lang as Locale;

  // Fetch promotion from Sanity
  const hasSanityConfig = isSanityConfigured();
  const promotion = hasSanityConfig
    ? await client
        .fetch(promotionBySlugQuery(localeTyped), { slug })
        .catch(() => null)
    : null;

  if (!promotion) {
    notFound();
  }

  // Translate CMS content
  const translatedPromotion = translateCMSNested(promotion, localeTyped, {
    logMissing: process.env.NODE_ENV === "development",
  });

  // Ensure CTA link includes locale
  const ctaLink = translatedPromotion.ctaLink
    ? translatedPromotion.ctaLink.startsWith("/")
      ? `/${lang}${translatedPromotion.ctaLink}`
      : translatedPromotion.ctaLink
    : `/${lang}/book`;

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const startDate = formatDate(translatedPromotion.startDate);
  const endDate = formatDate(translatedPromotion.endDate);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Banner Image */}
      <section className="relative h-[60vh] min-h-[400px]">
        {translatedPromotion.bannerImage && (
          <Image
            src={translatedPromotion.bannerImage}
            alt={translatedPromotion.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              {translatedPromotion.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {translatedPromotion.shortText}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Promotion Period */}
            {(startDate || endDate) && (
              <div className="flex flex-wrap gap-6 p-6 bg-card border border-border rounded-sm">
                {startDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{dict.home.promotions.starts}</p>
                      <p className="font-semibold">{startDate}</p>
                    </div>
                  </div>
                )}
                {endDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{dict.home.promotions.ends}</p>
                      <p className="font-semibold">{endDate}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full Description */}
            {translatedPromotion.fullDescription && (
              <div>
                <h2 className="text-3xl font-bold mb-4">{dict.home.promotions.aboutOffer}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                  {translatedPromotion.fullDescription}
                </p>
              </div>
            )}

            {/* Features/Benefits */}
            {translatedPromotion.features &&
              translatedPromotion.features.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">{dict.home.promotions.whatsIncluded}</h2>
                  <ul className="space-y-4">
                    {translatedPromotion.features.map(
                      (feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground text-lg">
                            {feature}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Terms & Conditions */}
            {translatedPromotion.terms && (
              <div className="p-6 bg-muted/30 border border-border rounded-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">
                    {dict.home.promotions.termsConditions}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {translatedPromotion.terms}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-card border border-border rounded-sm space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{dict.home.promotions.readyToBook}</h3>
                <p className="text-muted-foreground">
                  {dict.home.promotions.dontMissOut}
                </p>
              </div>

              <Button asChild size="lg" className="w-full text-lg py-6">
                <Link href={ctaLink}>
                  {translatedPromotion.ctaText || "Book Now"}
                </Link>
              </Button>

              {endDate && (
                <p className="text-sm text-center text-muted-foreground">
                  {dict.home.promotions.offerValidUntil} {endDate}
                </p>
              )}

              <div className="pt-6 border-t border-border">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${lang}`}>{dict.home.promotions.backToHome}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
