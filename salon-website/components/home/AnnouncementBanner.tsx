'use client'

import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface AnnouncementBannerProps {
  announcements: any[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  const getPriorityStyles = (priority: string = "medium") => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-red-950/30",
          border: "border-red-900/50",
          text: "text-red-200",
          iconColor: "text-red-400",
          icon: AlertCircle,
        };
      case "medium":
        return {
          bg: "bg-primary/10",
          border: "border-primary/30",
          text: "text-foreground",
          iconColor: "text-primary",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-card",
          border: "border-border",
          text: "text-muted-foreground",
          iconColor: "text-primary/70",
          icon: Info,
        };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="container mx-auto px-4">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-3"
      >
        {announcements.map((announcement) => {
          const styles = getPriorityStyles(announcement.priority);
          const Icon = styles.icon;

          return (
            <motion.div
              key={announcement._id}
              variants={item}
              className={`flex items-start gap-4 rounded-sm border p-6 ${styles.bg} ${styles.border} backdrop-blur-sm transition-all hover:border-primary/50`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${styles.iconColor} mt-0.5`} />
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${styles.text}`}>
                  {announcement.title}
                </h3>
                <p className={`mt-2 ${styles.text} opacity-80`}>
                  {announcement.message}
                </p>
                {announcement.scheduledDate && (
                  <p className={`mt-3 text-xs ${styles.text} opacity-60`}>
                    {new Date(announcement.scheduledDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
