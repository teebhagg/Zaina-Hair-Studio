import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  groups: [
    {
      name: "english",
      title: "🇬🇧 English",
    },
    {
      name: "german",
      title: "🇩🇪 German (Deutsch)",
    },
    {
      name: "details",
      title: "Details",
    },
  ],
  fields: [
    // English Content
    defineField({
      name: "name",
      title: "Service Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "english",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
      group: "english",
    }),

    // German Content
    defineField({
      name: "name_de",
      title: "Service Name (German)",
      type: "string",
      description: "German translation of the service name",
      group: "german",
    }),
    defineField({
      name: "description_de",
      title: "Description (German)",
      type: "text",
      description: "German translation of the description",
      group: "german",
    }),

    // Details (language-independent)
    defineField({
      name: "serviceType",
      title: "Service Type",
      type: "reference",
      to: [{ type: "serviceType" }],
      validation: (Rule) => Rule.required(),
      description:
        "The service type this service belongs to (e.g., Hair Cut, Nail Treatment)",
      group: "details",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: "details",
    }),
    defineField({
      name: "price",
      title: "Base Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
      group: "details",
    }),
    defineField({
      name: "duration",
      title: "Duration (minutes)",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
      group: "details",
    }),
    defineField({
      name: "extras",
      title: "Optional Extras",
      description:
        "Add optional extras for this service (e.g. ornaments, dyed hair, massage). These can be selected during booking.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Extra Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "price",
              title: "Additional Price",
              type: "number",
              // Allow zero or positive numbers
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: "duration",
              title: "Additional Duration (minutes)",
              type: "number",
              description:
                "Optional extra time this adds to the base service duration.",
              // Optional field, but if set it must be positive
              validation: (Rule) => Rule.positive(),
            },
            {
              name: "description",
              title: "Description (optional)",
              type: "text",
            },
          ],
          preview: {
            select: {
              title: "name",
              price: "price",
            },
            prepare({ title, price }) {
              return {
                title,
                subtitle:
                  typeof price === "number"
                    ? `+ $${price.toFixed(2)}`
                    : undefined,
              };
            },
          },
        },
      ],
      group: "details",
    }),
    defineField({
      name: "images",
      title: "Service Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
      description: "Upload one or more images for this service",
      group: "details",
    }),
    // Keep image field for backward compatibility (deprecated)
    defineField({
      name: "image",
      title: "Service Image (Deprecated - use Images above)",
      type: "image",
      options: {
        hotspot: true,
      },
      group: "details",
      hidden: true,
    }),
    defineField({
      name: "featured",
      title: "Featured Service",
      type: "boolean",
      initialValue: false,
      group: "details",
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images.0",
      price: "price",
    },
    prepare({ title, media, price }) {
      return {
        title,
        media,
        subtitle: `$${price}`,
      };
    },
  },
});
