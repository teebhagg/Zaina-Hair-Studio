import { AppointmentForm } from "@/components/booking/AppointmentForm";
import { locales, type Locale } from "@/lib/i18n";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { servicesQuery } from "@/lib/sanity/queries";
import { translateCMSArray } from "@/lib/utils/cms-locale";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!lang || !hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const langTyped = lang as Locale;
  const hasSanityConfig = isSanityConfigured();

  // Fetch services on the server, similar to services page
  const services = hasSanityConfig
    ? await client.fetch(servicesQuery(langTyped)).catch(() => [])
    : [];

  // Translate CMS content based on locale
  const translatedServices = translateCMSArray(services, langTyped, {
    logMissing: process.env.NODE_ENV === "development",
  }) as Array<{
    _id: string;
    name: string;
    slug: { current: string };
    price: number;
    duration: number;
  }>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">{dict.book.title}</h1>
          <p className="text-xl text-muted-foreground">{dict.book.subtitle}</p>
        </div>
        <AppointmentForm services={translatedServices} />
      </div>
    </div>
  );
}
