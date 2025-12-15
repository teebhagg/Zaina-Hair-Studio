"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GalleryItem } from "./GalleryItem";

interface GalleryGridProps {
  gallery: any[];
}

export function GalleryGrid({ gallery }: GalleryGridProps) {
  const { t } = useTranslation();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  if (gallery.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("gallery.noItems")}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {gallery.map((item: any, index: number) => (
        <GalleryItem key={item._id} {...item} index={index} />
      ))}
    </motion.div>
  );
}
