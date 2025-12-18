import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  __experimental_actions: [
    'create',
    'update',
    'publish',
  ],
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
      name: 'content',
      title: 'Content Selection',
    },
  ],
  fields: [
    // English Content
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'heroCtaText',
      title: 'Hero CTA Text',
      type: 'string',
      initialValue: 'Book Appointment',
      group: 'english',
    }),
    
    // German Content
    defineField({
      name: 'heroTitle_de',
      title: 'Hero Title (German)',
      type: 'string',
      description: 'German translation of the hero title',
      group: 'german',
    }),
    defineField({
      name: 'heroSubtitle_de',
      title: 'Hero Subtitle (German)',
      type: 'text',
      description: 'German translation of the hero subtitle',
      group: 'german',
    }),
    defineField({
      name: 'heroCtaText_de',
      title: 'Hero CTA Text (German)',
      type: 'string',
      initialValue: 'Termin buchen',
      description: 'German translation of the CTA button text',
      group: 'german',
    }),
    
    // Content Selection (language-independent)
    defineField({
      name: 'heroCtaLink',
      title: 'Hero CTA Link',
      type: 'string',
      initialValue: '/book',
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'content',
    }),
    defineField({
      name: 'featuredServices',
      title: 'Featured Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'service' }],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'featuredGallery',
      title: 'Featured Gallery Items',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'gallery' }],
        },
      ],
      group: 'content',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Content',
      }
    },
  },
})
