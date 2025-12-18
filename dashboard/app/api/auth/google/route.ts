import { oauth2Client } from '@/lib/google'
import { NextResponse } from 'next/server'

export async function GET() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // crucial for refresh token
    scope: scopes,
    prompt: 'consent', // force consent to ensure refresh token is returned
  })

  return NextResponse.redirect(url)
}
