import { google } from 'googleapis'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
// Fallback to localhost:3001 if env var is not set, suitable for dev
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('Missing Google Client ID or Secret')
}

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
)

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
