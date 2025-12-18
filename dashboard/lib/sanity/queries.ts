import { groq } from "next-sanity"

export function servicesQuery() {
  return groq`*[_type == "service"] | order(_createdAt desc) {
    _id,
    name,
    slug,
    price,
    duration,
    description,
    featured,
    "images": images[].asset->url,
    "image": image.asset->url,
    "serviceType": serviceType->slug.current
  }`
}

export function serviceBySlugQuery() {
  return groq`*[_type == "service" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    price,
    duration,
    description,
    featured,
    "images": images[].asset->url,
    "image": image.asset->url,
    "serviceType": serviceType->slug.current
  }`
}



