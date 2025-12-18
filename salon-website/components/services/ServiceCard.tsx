"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ServiceCardProps {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  duration: number;
  description: string;
  image?: string;
  images?: string[];
  featured?: boolean;
}

export function ServiceCard({
  _id,
  name,
  slug,
  price,
  duration,
  description,
  image,
  images,
  featured,
}: ServiceCardProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // Use images array if available, otherwise fall back to single image
  const displayImage = images && images.length > 0 ? images[0] : image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        {displayImage && (
          <div className="relative h-48 w-full">
            <Image
              src={displayImage}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {featured && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold">
                {t("services.featured")}
              </div>
            )}
          </div>
        )}
        <CardHeader>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold text-foreground">${price}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {duration} {t("services.minutes")}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/${locale}/services/${slug.current}`}>
              {t("services.viewDetails")}
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/${locale}/book?service=${slug.current}`}>
              {t("services.bookNow")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
