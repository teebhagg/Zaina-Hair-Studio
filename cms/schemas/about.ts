import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  // Make it a singleton - only one document can exist
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
      name: 'media',
      title: 'Media',
    },
  ],
  fields: [
    // English Content
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'About Us',
      group: 'english',
    }),
    defineField({
      name: 'heading',
      title: 'Main Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'mission',
      title: 'Mission Statement',
      type: 'text',
      group: 'english',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Value Title' },
            { name: 'title_de', type: 'string', title: 'Value Title (German)' },
            { name: 'description', type: 'text', title: 'Description' },
            { name: 'description_de', type: 'text', title: 'Description (German)' },
          ],
          preview: {
            select: {
              title: 'title',
            },
          },
        },
      ],
      group: 'english',
    }),
    
    // German Content
    defineField({
      name: 'title_de',
      title: 'Page Title (German)',
      type: 'string',
      description: 'German translation of the page title',
      group: 'german',
    }),
    defineField({
      name: 'heading_de',
      title: 'Main Heading (German)',
      type: 'string',
      description: 'German translation of the main heading',
      group: 'german',
    }),
    defineField({
      name: 'mission_de',
      title: 'Mission Statement (German)',
      type: 'text',
      description: 'German translation of the mission statement',
      group: 'german',
    }),
    defineField({
      name: 'content_de',
      title: 'Content (German)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'German translation of the content',
      group: 'german',
    }),
    
    // Media
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'media',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'About Page Content',
      }
    },
  },
})
