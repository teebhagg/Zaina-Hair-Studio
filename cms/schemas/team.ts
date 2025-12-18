import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'team',
  title: 'Team Member',
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
    // Name (language-independent)
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'details',
    }),
    
    // English Content
    defineField({
      name: 'role',
      title: 'Role/Position',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'english',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      group: 'english',
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'english',
    }),
    
    // German Content
    defineField({
      name: 'role_de',
      title: 'Role/Position (German)',
      type: 'string',
      description: 'German translation of the role',
      group: 'german',
    }),
    defineField({
      name: 'bio_de',
      title: 'Biography (German)',
      type: 'text',
      description: 'German translation of the biography',
      group: 'german',
    }),
    defineField({
      name: 'specialties_de',
      title: 'Specialties (German)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'German translation of specialties',
      group: 'german',
    }),
    
    // Details (language-independent)
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'details',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
      group: 'details',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'facebook', type: 'url', title: 'Facebook' },
        { name: 'twitter', type: 'url', title: 'Twitter' },
      ],
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
})
