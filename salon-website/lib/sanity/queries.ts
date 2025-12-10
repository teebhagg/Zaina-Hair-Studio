import { groq } from 'next-sanity'

export const servicesQuery = groq`*[_type == "service"] | order(_createdAt desc) {
  _id,
  name,
  slug,
  price,
  duration,
  description,
  featured,
  "image": image.asset->url
}`

export const serviceBySlugQuery = groq`*[_type == "service" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  price,
  duration,
  description,
  featured,
  "image": image.asset->url
}`

export const featuredServicesQuery = groq`*[_type == "service" && featured == true] | order(_createdAt desc) [0...6] {
  _id,
  name,
  slug,
  price,
  duration,
  description,
  "image": image.asset->url
}`

export const galleryQuery = groq`*[_type == "gallery"] | order(_createdAt desc) {
  _id,
  caption,
  category,
  featured,
  "image": image.asset->url
}`

export const featuredGalleryQuery = groq`*[_type == "gallery" && featured == true] | order(_createdAt desc) [0...8] {
  _id,
  caption,
  category,
  "image": image.asset->url
}`

export const promotionsQuery = groq`*[_type == "promotion" && active == true] | order(_createdAt desc) {
  _id,
  title,
  shortText,
  ctaText,
  ctaLink,
  startDate,
  endDate,
  "bannerImage": bannerImage.asset->url
}`

export const homepageQuery = groq`*[_type == "homepage"][0] {
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
    "image": image.asset->url
  },
  featuredGallery[]->{
    _id,
    caption,
    category,
    "image": image.asset->url
  }
}`

export const announcementsQuery = groq`*[_type == "announcement" && active == true] | order(scheduledDate desc, _createdAt desc) {
  _id,
  title,
  message,
  scheduledDate,
  priority
}`

export const aboutQuery = groq`*[_type == "about"][0] {
  title,
  heading,
  content,
  mission,
  values,
  "image": image.asset->url
}`

export const teamQuery = groq`*[_type == "team"] | order(_createdAt desc) {
  _id,
  name,
  role,
  bio,
  specialties,
  email,
  socialLinks,
  "image": image.asset->url
}`
