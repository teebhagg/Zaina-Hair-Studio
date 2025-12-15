import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { Toaster } from "@/components/ui/toaster";
import { defaultLocale, locales } from "@/lib/i18n";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { hasLocale } from "./dictionaries";
import { client } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zainab's Adeshola Salon",
  description: "Premium salon services with expert care",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  let lang: string;

  try {
    const resolvedParams = await params;
    lang = resolvedParams?.lang;
  } catch {
    lang = defaultLocale;
  }

  // Validate locale
  if (!lang || !hasLocale(lang)) {
    notFound();
  }

  // Fetch site settings for Footer
  let siteSettings = null;
  try {
    siteSettings = await client.fetch(siteSettingsQuery());
  } catch (error) {
    console.error('Error fetching site settings:', error);
  }

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <I18nProvider locale={lang}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer siteSettings={siteSettings} />
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
