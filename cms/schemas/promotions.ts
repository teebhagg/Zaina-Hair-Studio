import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  groups: [
    {
      name: 'english',
      title: '🇬🇧 English',
    },
    {
      name: 'german',
      title: '🇩🇪 German (Deutsch)',
    },
    {
      name: 'settings',
      title: 'Settings',
    },
  ],
  fields: [
    // English Content
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'shortText',
      title: 'Short Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(200),
      group: 'english',
    }),
    defineField({
      name: 'ctaText',
      title: 'Call-to-Action Text',
      type: 'string',
      initialValue: 'Book Now',
      group: 'english',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'text',
      description: 'Detailed description for the promotion detail page',
      group: 'english',
    }),
    defineField({
      name: 'features',
      title: 'Features/Benefits',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of features or benefits included in this promotion',
      group: 'english',
    }),
    defineField({
      name: 'terms',
      title: 'Terms & Conditions',
      type: 'text',
      description: 'Terms and conditions for this promotion',
      group: 'english',
    }),
    
    // German Content
    defineField({
      name: 'title_de',
      title: 'Title (German)',
      type: 'string',
      description: 'German translation of the title',
      group: 'german',
    }),
    defineField({
      name: 'shortText_de',
      title: 'Short Description (German)',
      type: 'text',
      validation: (Rule) => Rule.max(200),
      description: 'German translation of the short description',
      group: 'german',
    }),
    defineField({
      name: 'ctaText_de',
      title: 'Call-to-Action Text (German)',
      type: 'string',
      initialValue: 'Jetzt buchen',
      description: 'German translation of the CTA button text',
      group: 'german',
    }),
    defineField({
      name: 'fullDescription_de',
      title: 'Full Description (German)',
      type: 'text',
      description: 'German translation of the detailed description',
      group: 'german',
    }),
    defineField({
      name: 'features_de',
      title: 'Features/Benefits (German)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'German translation of features or benefits',
      group: 'german',
    }),
    defineField({
      name: 'terms_de',
      title: 'Terms & Conditions (German)',
      type: 'text',
      description: 'German translation of terms and conditions',
      group: 'german',
    }),
    
    // Settings (language-independent)
    defineField({
      name: 'images',
      title: 'Promotion Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
      description: 'Upload one or more images for this promotion',
      group: 'settings',
    }),
    // Keep bannerImage field for backward compatibility (deprecated)
    defineField({
      name: 'bannerImage',
      title: 'Banner Image (Deprecated - use Images above)',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'settings',
      hidden: true,
    }),
    defineField({
      name: 'ctaLink',
      title: 'Call-to-Action Link',
      type: 'string',
      initialValue: '/book',
      group: 'settings',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Only active promotions will be displayed',
      group: 'settings',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      group: 'settings',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      group: 'settings',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0',
      active: 'active',
    },
    prepare({ title, media, active }) {
      return {
        title,
        media,
        subtitle: active ? 'Active' : 'Inactive',
      }
    },
  },
})
