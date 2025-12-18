# CMS Language Input Guide

## Overview

All CMS schemas are now organized with **language tabs** to make it easy to input content in both English and German.

## How It Works

![Language Tabs](file:///Users/mac/.gemini/antigravity/brain/258b63b4-b6d3-4451-a349-c07b8ec92927/cms_language_tabs_1765498149854.png)

When editing any content in Sanity Studio, you'll see **three tabs** at the top:

### 🇬🇧 English Tab
- Contains all English content fields
- **Required** - Must be filled in (serves as fallback)
- Examples: Service Name, Description, etc.

### 🇩🇪 German (Deutsch) Tab
- Contains all German translation fields
- **Optional** - Can be left empty
- If empty, English content will be displayed to German users
- Examples: Service Name (German), Description (German), etc.

### Details/Settings Tab
- Contains language-independent fields
- Examples: Price, Duration, Images, Active status, etc.
- These fields are the same for all languages

## Content Types with Language Support

All content types now have language tabs:

### ✅ Services
- **English**: Service Name, Description
- **German**: Service Name (German), Description (German)
- **Details**: Slug, Price, Duration, Image, Featured

### ✅ Homepage
- **English**: Hero Title, Hero Subtitle, Hero CTA Text
- **German**: Hero Title (German), Hero Subtitle (German), Hero CTA Text (German)
- **Content Selection**: Hero CTA Link, Hero Image, Featured Services, Featured Gallery

### ✅ About Page
- **English**: Page Title, Main Heading, Mission Statement, Content, Values
- **German**: Page Title (German), Main Heading (German), Mission Statement (German), Content (German)
- **Media**: Featured Image

### ✅ Gallery
- **English**: Caption
- **German**: Caption (German)
- **Details**: Image, Category, Featured

### ✅ Promotions
- **English**: Title, Short Description, CTA Text
- **German**: Title (German), Short Description (German), CTA Text (German)
- **Settings**: Banner Image, CTA Link, Active, Start Date, End Date

### ✅ Team Members
- **English**: Role/Position, Biography, Specialties
- **German**: Role/Position (German), Biography (German), Specialties (German)
- **Details**: Name, Photo, Email, Social Links

### ✅ Announcements
- **English**: Title, Message
- **German**: Title (German), Message (German)
- **Settings**: Scheduled Date, Active, Priority

## Workflow for Content Editors

### 1. Create New Content
1. Click "Create" and select content type (e.g., Service)
2. Go to **🇬🇧 English** tab
3. Fill in all English fields
4. Go to **🇩🇪 German** tab
5. Fill in German translations (optional)
6. Go to **Details** tab
7. Fill in language-independent fields (price, image, etc.)
8. Click **Publish**

### 2. Edit Existing Content
1. Open the content item
2. Switch between tabs to edit different language versions
3. Click **Publish** to save changes

### 3. Quick Translation Check
- If a German field is empty, the website will automatically show the English version to German visitors
- You can leave German fields empty and fill them in later

## Best Practices

### ✅ DO:
- **Always fill English fields** - They're required and serve as fallback
- **Use clear, descriptive content** - Makes translation easier
- **Review German translations** - Ensure they make sense
- **Keep formatting consistent** - Between English and German versions

### ❌ DON'T:
- **Don't leave English fields empty** - They're required
- **Don't use machine translation without review** - May sound awkward
- **Don't forget to publish** - Changes won't appear until published

## Language Indicators

Each German field has a clear description:
- "German translation of the [field name]"

This helps you know exactly what to translate.

## What Happens on the Website?

### English Visitor (`/en/...`)
- Sees all English content
- Example: "Hair Coloring and Highlights"

### German Visitor (`/de/...`)
- Sees German content if available
- Falls back to English if German is empty
- Example: "Haarfärbung und Strähnchen" (if filled) or "Hair Coloring and Highlights" (if empty)

## Need Help?

If you're unsure about a translation:
1. Leave the German field empty
2. The English version will display automatically
3. You can add the German translation later

---

**Remember**: English is required, German is optional. The website will always work, even if German translations are missing!
