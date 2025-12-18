import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    {
      name: "contact",
      title: "Contact Information",
    },
    {
      name: "social",
      title: "Social Media",
    },
    {
      name: "hours",
      title: "Business Hours",
    },
  ],
  fields: [
    // Contact Information
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
      group: "contact",
    }),
    // Location field - map coordinates
    defineField({
      name: "location",
      title: "Location (Map Coordinates)",
      type: "geopoint",
      description:
        "Click on the map or search for an address to set the location coordinates.",
      validation: (Rule) => Rule.required(),
      group: "contact",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "string",
      description:
        "Enter the full address. Format: '123 Beauty Street, New York, NY 10001'",
      validation: (Rule) => Rule.required(),
      group: "contact",
      placeholder: "123 Beauty Street, New York, NY 10001",
    }),
    defineField({
      name: "googleMapsEmbedUrl",
      title: "Google Maps Embed URL (Optional)",
      type: "url",
      description:
        "Optional: Custom embed URL. If not provided, will be generated from coordinates above.",
      group: "contact",
    }),

    // Social Media Links
    defineField({
      name: "instagram",
      title: "Instagram URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "facebook",
      title: "Facebook URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "twitter",
      title: "Twitter/X URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "tiktok",
      title: "TikTok URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "youtube",
      title: "YouTube URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
      group: "social",
    }),

    // Business Hours - Simplified to an array
    defineField({
      name: "businessHours",
      title: "Business Hours",
      type: "array",
      description: "Add your business hours for each day",
      group: "hours",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "day",
              title: "Day",
              type: "string",
              options: {
                list: [
                  { title: "Monday", value: "monday" },
                  { title: "Tuesday", value: "tuesday" },
                  { title: "Wednesday", value: "wednesday" },
                  { title: "Thursday", value: "thursday" },
                  { title: "Friday", value: "friday" },
                  { title: "Saturday", value: "saturday" },
                  { title: "Sunday", value: "sunday" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "hours",
              title: "Hours",
              type: "string",
              description: 'e.g., "9:00 AM - 7:00 PM" or "Closed"',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              day: "day",
              hours: "hours",
            },
            prepare({ day, hours }) {
              return {
                title: day ? day.charAt(0).toUpperCase() + day.slice(1) : "Day",
                subtitle: hours || "Not set",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
        subtitle: "Contact & Social Media Information",
      };
    },
  },
});
