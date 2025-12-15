# Internationalization (i18n) Guide

## Overview

The Zaina's Hair Studio website supports multiple languages through a comprehensive internationalization system. The original CMS content is in **English**, with translations available for other languages (currently **German**).

## How It Works

### 1. Language Detection & Selection

The system automatically detects the user's preferred language through:

1. **URL Path**: `/en/...` or `/de/...`
2. **Browser Settings**: `Accept-Language` header
3. **Local Storage**: Previously selected language
4. **Navigator API**: Browser's language preference

Priority order: URL path → localStorage → navigator → Accept-Language header

### 2. CMS Content Translation

All translatable content in Sanity CMS has separate fields for each language:

- **English** (primary): `name`, `description`, `title`, etc.
- **German**: `name_de`, `description_de`, `title_de`, etc.

The system automatically selects the appropriate field based on the current locale, falling back to English if a translation is missing.

### 3. Translation Utilities

Located in `/lib/utils/cms-translator.ts`, these utilities handle automatic field translation:

#### `translateCMSObject(obj, locale, config?)`
Translates all fields in a single object.

```typescript
const translatedService = translateCMSObject(service, 'de', { 
  logMissing: process.env.NODE_ENV === 'development' 
})
// service.name_de → service.name (if German locale)
```

#### `translateCMSArray(array, locale, config?)`
Translates an array of objects.

```typescript
const translatedServices = translateCMSArray(services, 'de')
```

#### `translateCMSNested(obj, locale, config?)`
Translates nested objects and arrays recursively.

```typescript
const translatedHomepage = translateCMSNested(homepage, 'de')
// Handles homepage.featuredServices[].name_de automatically
```

#### `translateField(baseValue, localizedValue, locale)`
Simple field translation (backward compatible with `getCMSField`).

```typescript
const name = translateField(service.name, service.name_de, 'de')
```

## Adding New Translatable Content

### Step 1: Update CMS Schema

Add localized fields to your schema:

```typescript
// cms/schemas/myContent.ts
defineField({
  name: 'title',
  title: 'Title (English)',
  type: 'string',
  validation: (Rule) => Rule.required(),
}),
defineField({
  name: 'title_de',
  title: 'Title (German)',
  type: 'string',
}),
```

### Step 2: Update Query

Include localized fields in your GROQ query:

```typescript
export function myContentQuery(locale: Locale = "en") {
  if (locale === "en") {
    return groq`*[_type == "myContent"] {
      _id,
      title,
      description
    }`
  }

  return groq`*[_type == "myContent"] {
    _id,
    title,
    title_de,
    description,
    description_de
  }`
}
```

### Step 3: Use Translation Utility

In your page component:

```typescript
const content = await client.fetch(myContentQuery(locale))
const translated = translateCMSObject(content, locale, { 
  logMissing: process.env.NODE_ENV === 'development' 
})
```

## Adding a New Language

### Step 1: Update Locale Configuration

```typescript
// lib/i18n.ts
export const locales = ['en', 'de', 'fr'] as const // Add 'fr'
```

### Step 2: Add Field Suffix Mapping

```typescript
// lib/types/cms-types.ts
export const LOCALE_FIELD_SUFFIX: Record<Locale, string> = {
  en: "",
  de: "_de",
  fr: "_fr", // Add French
}
```

### Step 3: Update CMS Schemas

Add new language fields to all translatable schemas:

```typescript
defineField({
  name: 'title_fr',
  title: 'Title (French)',
  type: 'string',
}),
```

### Step 4: Update Queries

Include new language fields in queries (follow pattern from Step 2 above).

### Step 5: Add UI Translations

Create `/messages/fr.json` with UI translations:

```json
{
  "home": {
    "hero": {
      "title": "Bienvenue",
      ...
    }
  }
}
```

## Development Features

### Missing Translation Warnings

In development mode, the system logs warnings when translations are missing:

```typescript
const translated = translateCMSObject(content, 'de', { 
  logMissing: true // Logs missing translations to console
})
```

Console output:
```
[i18n] Missing translation for field "description" in locale "de"
```

### Translation Coverage

Check translation completeness:

```typescript
import { getTranslationCoverage } from '@/lib/utils/cms-translator'

const coverage = getTranslationCoverage(service, 'de')
// { total: 5, translated: 3, percentage: 60, missing: ['description', 'ctaText'] }
```

## Best Practices

### For Content Editors

1. **Always fill English fields** - They serve as fallback for all languages
2. **Use consistent terminology** - Maintain a glossary for translations
3. **Test in all languages** - Preview content in each supported locale
4. **Keep translations current** - Update all language versions when changing content

### For Developers

1. **Use translation utilities** - Don't manually map fields
2. **Enable logging in development** - Catch missing translations early
3. **Handle fallbacks gracefully** - English should always be available
4. **Type your content** - Use TypeScript interfaces for CMS data
5. **Test language switching** - Verify all pages work in all locales

## Troubleshooting

### Content not translating

1. Check that localized fields exist in CMS schema
2. Verify query includes localized fields for non-English locales
3. Ensure translation utility is being used
4. Check browser console for missing translation warnings

### Language not detected

1. Verify locale is in `locales` array in `lib/i18n.ts`
2. Check middleware is running (URL should have locale prefix)
3. Clear localStorage and browser cache
4. Check `Accept-Language` header in browser dev tools

### Fallback not working

1. Ensure English field has a value in CMS
2. Check translation utility is using correct field names
3. Verify `LOCALE_FIELD_SUFFIX` mapping is correct

## File Structure

```
salon-website/
├── lib/
│   ├── i18n.ts                    # Locale configuration
│   ├── i18n/
│   │   └── config.ts              # i18next configuration
│   ├── types/
│   │   └── cms-types.ts           # Translation type definitions
│   └── utils/
│       ├── cms-translator.ts      # Translation utilities
│       └── cms-locale.ts          # Legacy helper (deprecated)
├── messages/
│   ├── en.json                    # English UI translations
│   └── de.json                    # German UI translations
└── app/[lang]/                    # Locale-based routing
    └── (site)/
        ├── page.tsx               # Homepage
        ├── services/
        │   ├── page.tsx           # Services list
        │   └── [slug]/page.tsx    # Service detail
        ├── about/page.tsx         # About page
        └── gallery/page.tsx       # Gallery page
```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Sanity Localization](https://www.sanity.io/docs/localization)
