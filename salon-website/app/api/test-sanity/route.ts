import { client } from '@/lib/sanity/client';
import { announcementsQuery, promotionsQuery } from '@/lib/sanity/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [announcements, promotions] = await Promise.all([
      client.fetch(announcementsQuery('en')).catch(err => ({ error: err.message })),
      client.fetch(promotionsQuery('en')).catch(err => ({ error: err.message })),
    ]);

    return NextResponse.json({
      announcements,
      promotions,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
