import { AppointmentForm } from "@/components/booking/AppointmentForm";
import { locales, type Locale } from "@/lib/i18n";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { promotionBySlugQuery, promotionsQuery, servicesQuery } from "@/lib/sanity/queries";
import { translateCMSArray, translateCMSNested } from "@/lib/utils/cms-locale";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ service?: string; promotion?: string }>;
}) {
  const { lang } = await params;
  const { service, promotion } = await searchParams;

  if (!lang || !hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const langTyped = lang as Locale;
  const hasSanityConfig = isSanityConfigured();

  // Fetch services and promotions on the server
  const [services, promotions] = await Promise.all([
    hasSanityConfig
      ? client.fetch(servicesQuery(langTyped)).catch(() => [])
      : Promise.resolve([]),
    hasSanityConfig
      ? client.fetch(promotionsQuery(langTyped)).catch(() => [])
      : Promise.resolve([]),
  ]);

  // Translate CMS content based on locale
  const translatedServices = translateCMSArray(services, langTyped, {
    logMissing: process.env.NODE_ENV === "development",
  }) as Array<{
    _id: string;
    name: string;
    slug: { current: string };
    price: number;
    duration: number;
    serviceType?: string;
    extras?: Array<{
      name: string;
      price: number;
      duration?: number | null;
      description?: string | null;
    }>;
  }>;

  // Translate promotions
  const translatedPromotions = translateCMSArray(promotions, langTyped, {
    logMissing: process.env.NODE_ENV === "development",
  }) as Array<{
    _id: string;
    title: string;
    slug: { current: string };
    shortText?: string;
    fullDescription?: string;
    features?: string[];
  }>;

  // Fetch promotion data if promotion slug is provided
  let promotionData = null;
  if (promotion && hasSanityConfig) {
    try {
      const promo = await client
        .fetch(promotionBySlugQuery(langTyped), { slug: promotion })
        .catch(() => null);
      if (promo) {
        promotionData = translateCMSNested(promo, langTyped, {
          logMissing: process.env.NODE_ENV === "development",
        });
      }
    } catch (error) {
      console.error("Error fetching promotion:", error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-background text-foreground">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-primary">
            {dict.book.title}
          </h1>
          <p className="text-xl text-muted-foreground">{dict.book.subtitle}</p>
        </div>
        <AppointmentForm 
          services={translatedServices} 
          promotions={translatedPromotions}
          initialService={service}
          initialPromotion={promotion}
        />
      </div>
    </div>
  );
}
