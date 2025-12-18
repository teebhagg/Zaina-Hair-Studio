import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gallery',
  title: 'Gallery',
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
      name: 'details',
      title: 'Details',
    },
  ],
  fields: [
    // Image (language-independent)
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
      group: 'details',
    }),
    
    // English Content
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      group: 'english',
    }),
    
    // German Content
    defineField({
      name: 'caption_de',
      title: 'Caption (German)',
      type: 'string',
      description: 'German translation of the caption',
      group: 'german',
    }),
    
    // Details (language-independent)
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Hair', value: 'hair' },
          { title: 'Nails', value: 'nails' },
          { title: 'Makeup', value: 'makeup' },
          { title: 'Spa', value: 'spa' },
          { title: 'General', value: 'general' },
        ],
      },
      initialValue: 'general',
      group: 'details',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'caption',
      media: 'image',
      category: 'category',
    },
    prepare({ title, media, category }) {
      return {
        title: title || 'Untitled',
        media,
        subtitle: category ? category.charAt(0).toUpperCase() + category.slice(1) : '',
      }
    },
  },
})
