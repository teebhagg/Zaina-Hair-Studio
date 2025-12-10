import { client, isSanityConfigured } from '@/lib/sanity/client'
import { galleryQuery } from '@/lib/sanity/queries'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { GalleryHeader } from '@/components/gallery/GalleryHeader'

export default async function GalleryPage() {
  const hasSanityConfig = isSanityConfigured()
  const gallery = hasSanityConfig
    ? await client.fetch(galleryQuery).catch((error) => {
        console.error('Error fetching gallery:', error)
        return []
      })
    : []

  return (
    <div className="container mx-auto px-4 py-12">
      <GalleryHeader />
      <GalleryGrid gallery={gallery} />
    </div>
  )
}
