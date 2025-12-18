import type { Locale } from "@/lib/i18n";
import { groq } from "next-sanity";

export function servicesQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "service"] | order(_createdAt desc) {
      _id,
      name,
      slug,
      price,
      duration,
      description,
      extras[]{
        name,
        price,
        duration,
        description
      },
      featured,
      "images": images[].asset->url,
      "image": image.asset->url,
      "serviceType": serviceType->slug.current
    }`;
  }

  // For German, fetch both English and German fields separately
  return groq`*[_type == "service"] | order(_createdAt desc) {
    _id,
    name,
    name_de,
    slug,
    price,
    duration,
    description,
    description_de,
    extras[]{
      name,
      price,
      duration,
      description
    },
    featured,
    "images": images[].asset->url,
    "image": image.asset->url,
    "serviceType": serviceType->slug.current
  }`;
}

export function serviceBySlugQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "service" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      price,
      duration,
      description,
      extras[]{
        name,
        price,
        duration,
        description
      },
      featured,
      "images": images[].asset->url,
      "image": image.asset->url,
      "serviceType": serviceType->slug.current
    }`;
  }

  return groq`*[_type == "service" && slug.current == $slug][0] {
    _id,
    name,
    name_de,
    slug,
    price,
    duration,
    description,
    description_de,
    extras[]{
      name,
      price,
      duration,
      description
    },
    featured,
    "images": images[].asset->url,
    "image": image.asset->url,
    "serviceType": serviceType->slug.current
  }`;
}

export function featuredServicesQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "service" && featured == true] | order(_createdAt desc) [0...6] {
      _id,
      name,
      slug,
      price,
      duration,
      description,
      "images": images[].asset->url,
      "image": image.asset->url,
      "serviceType": serviceType->slug.current
    }`;
  }

  return groq`*[_type == "service" && featured == true] | order(_createdAt desc) [0...6] {
    _id,
    name,
    name_de,
    slug,
    price,
    duration,
    description,
    description_de,
    "images": images[].asset->url,
    "image": image.asset->url,
    "serviceType": serviceType->slug.current
  }`;
}

export function galleryQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "gallery"] | order(_createdAt desc) {
      _id,
      caption,
      category,
      featured,
      "image": image.asset->url
    }`;
  }

  return groq`*[_type == "gallery"] | order(_createdAt desc) {
    _id,
    caption,
    caption_de,
    category,
    featured,
    "image": image.asset->url
  }`;
}

export function featuredGalleryQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "gallery" && featured == true] | order(_createdAt desc) [0...8] {
      _id,
      caption,
      category,
      "image": image.asset->url
    }`;
  }

  return groq`*[_type == "gallery" && featured == true] | order(_createdAt desc) [0...8] {
    _id,
    caption,
    caption_de,
    category,
    "image": image.asset->url
  }`;
}

export function promotionsQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "promotion" && active == true] | order(_createdAt desc) {
      _id,
      title,
      slug,
      shortText,
      ctaText,
      ctaLink,
      startDate,
      endDate,
      "images": images[].asset->url,
      "bannerImage": bannerImage.asset->url
    }`;
  }

  return groq`*[_type == "promotion" && active == true] | order(_createdAt desc) {
    _id,
    title,
    title_de,
    slug,
    shortText,
    shortText_de,
    ctaText,
    ctaText_de,
    ctaLink,
    startDate,
    endDate,
    "images": images[].asset->url,
    "bannerImage": bannerImage.asset->url
  }`;
}

export function promotionBySlugQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "promotion" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      shortText,
      fullDescription,
      features,
      terms,
      ctaText,
      ctaLink,
      startDate,
      endDate,
      active,
      "images": images[].asset->url,
      "bannerImage": bannerImage.asset->url
    }`;
  }

  return groq`*[_type == "promotion" && slug.current == $slug][0] {
    _id,
    title,
    title_de,
    slug,
    shortText,
    shortText_de,
    fullDescription,
    fullDescription_de,
    features,
    features_de,
    terms,
    terms_de,
    ctaText,
    ctaText_de,
    ctaLink,
    startDate,
    endDate,
    active,
    "images": images[].asset->url,
    "bannerImage": bannerImage.asset->url
  }`;
}

export function homepageQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "homepage"][0] {
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroCtaLink,
      "heroImage": heroImage.asset->url,
      featuredServices[]->{
        _id,
        name,
        slug,
        price,
        duration,
        description,
        extras[]{
          name,
          price,
          duration,
          description
        },
        "images": images[].asset->url,
        "image": image.asset->url,
        "serviceType": serviceType->slug.current
      },
      featuredGallery[]->{
        _id,
        caption,
        category,
        "image": image.asset->url
      }
    }`;
  }

  // For German, fetch both English and German fields separately
  return groq`*[_type == "homepage"][0] {
    heroTitle,
    heroTitle_de,
    heroSubtitle,
    heroSubtitle_de,
    heroCtaText,
    heroCtaText_de,
    heroCtaLink,
    "heroImage": heroImage.asset->url,
    featuredServices[]->{
      _id,
      name,
      name_de,
      slug,
      price,
      duration,
      description,
      description_de,
        extras[]{
          name,
          price,
          duration,
          description
        },
      "images": images[].asset->url,
      "image": image.asset->url,
      "serviceType": serviceType->slug.current
    },
    featuredGallery[]->{
      _id,
      caption,
      caption_de,
      category,
      "image": image.asset->url
    }
  }`;
}

export function announcementsQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "announcement" && active == true] | order(scheduledDate desc, _createdAt desc) {
      _id,
      title,
      message,
      scheduledDate,
      priority
    }`;
  }

  return groq`*[_type == "announcement" && active == true] | order(scheduledDate desc, _createdAt desc) {
    _id,
    title,
    title_de,
    message,
    message_de,
    scheduledDate,
    priority
  }`;
}

export function aboutQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "about"][0] {
      title,
      heading,
      mission,
      content,
      values[]{
        title,
        description
      },
      "image": image.asset->url
    }`;
  }

  return groq`*[_type == "about"][0] {
    title,
    title_de,
    heading,
    heading_de,
    mission,
    mission_de,
    content,
    content_de,
    values[]{
      title,
      title_de,
      description,
      description_de
    },
    "image": image.asset->url
  }`;
}

export function teamQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "team"] | order(_createdAt desc) {
      _id,
      name,
      role,
      bio,
      specialties,
      email,
      socialLinks,
      "image": image.asset->url
    }`;
  }

  return groq`*[_type == "team"] | order(_createdAt desc) {
    _id,
    name,
    role,
    role_de,
    bio,
    bio_de,
    specialties,
    specialties_de,
    email,
    socialLinks,
    "image": image.asset->url
  }`;
}

export function siteSettingsQuery() {
  return groq`*[_type == "siteSettings"][0] {
    phone,
    email,
    address,
    location,
    googleMapsEmbedUrl,
    instagram,
    facebook,
    twitter,
    tiktok,
    youtube,
    linkedin,
    businessHours
  }`;
}
