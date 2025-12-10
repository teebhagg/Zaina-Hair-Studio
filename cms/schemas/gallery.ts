import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
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
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
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

