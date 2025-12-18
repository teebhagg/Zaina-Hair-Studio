import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'serviceType',
  title: 'Service Type',
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
    // English Content
    defineField({
      name: 'name',
      title: 'Service Type Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    
    // German Content
    defineField({
      name: 'name_de',
      title: 'Service Type Name (German)',
      type: 'string',
      description: 'German translation of the service type name',
      group: 'german',
    }),
    
    // Details (language-independent)
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
    prepare({ title }) {
      return {
        title,
      }
    },
  },
})

