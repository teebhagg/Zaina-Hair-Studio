# Zainab's Adeshola Salon - Complete Website System

A comprehensive salon management system with customer-facing website, admin dashboard, and content management system.

## Project Structure

```
/
├── cms/                    # Sanity Studio for content management
├── salon-website/          # Customer-facing Next.js application
└── dashboard/              # Admin dashboard Next.js application
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or Atlas)
- Sanity account
- Resend account (for emails)

### 1. Sanity CMS Setup

```bash
cd cms
npm install
npm run dev
```

Configure your Sanity project:

- Create a new project at [sanity.io](https://sanity.io)
- Update `sanity.config.ts` with your project ID and dataset
- Set environment variables in `.env.local`:
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_TOKEN`

### 2. Salon Website Setup

```bash
cd salon-website
npm install --legacy-peer-deps
npm run dev
```

**Note:** `--legacy-peer-deps` is required for React 19 compatibility with some packages.

Set up environment variables in `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com
```

### 3. Admin Dashboard Setup

```bash
cd dashboard
npm install --legacy-peer-deps
npm run dev
```

**Note:** `--legacy-peer-deps` is required for React 19 compatibility with some packages.

Set up environment variables in `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=http://localhost:3001
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com
```

### 4. Database Setup

1. Ensure MongoDB is running
2. Run the seed script to create initial admin user:
   ```bash
   cd dashboard
   npm run seed
   ```
   Default credentials (change after first login):
   - Email: admin@example.com
   - Password: (set in seed script)

## Features

### Customer Website

- Service listings and details
- Gallery showcase
- Review and rating system
- Appointment booking with email confirmations
- About and contact pages
- Responsive design with animations

### Admin Dashboard

- Appointment management
- Review moderation
- Content management (announcements, promotions)
- Gallery management
- Secure authentication

### CMS (Sanity)

- Service management
- Gallery content
- Promotions and deals
- Homepage content
- Announcements
- About page content
- Team members

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Animations**: Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email**: Resend
- **CMS**: Sanity
- **Maps**: Google Maps Embed

## Important Notes

### React 19 & Tailwind v4

This project uses **React 19** and **Tailwind CSS v4**. Some packages may show peer dependency warnings. Use `--legacy-peer-deps` flag when installing dependencies. See `INSTALL.md` for detailed instructions.

## Development

Each project runs independently:

- CMS: `http://localhost:3333`
- Salon Website: `http://localhost:3000`
- Dashboard: `http://localhost:3001`

## License

Private project - All rights reserved
