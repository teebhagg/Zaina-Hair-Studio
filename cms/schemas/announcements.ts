import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'announcement',
  title: 'Announcement',
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
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
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
      name: 'message_de',
      title: 'Message (German)',
      type: 'text',
      description: 'German translation of the message',
      group: 'german',
    }),
    
    // Settings (language-independent)
    defineField({
      name: 'scheduledDate',
      title: 'Scheduled Date',
      type: 'datetime',
      description: 'When should this announcement be displayed?',
      group: 'settings',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
        ],
      },
      initialValue: 'medium',
      group: 'settings',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      active: 'active',
      scheduledDate: 'scheduledDate',
    },
    prepare({ title, active, scheduledDate }) {
      return {
        title,
        subtitle: active ? `Active${scheduledDate ? ` - ${new Date(scheduledDate).toLocaleDateString()}` : ''}` : 'Inactive',
      }
    },
  },
})
