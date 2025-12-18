import { NextResponse } from 'next/server'
import AppointmentModel from '@/lib/db/models/Appointment'
import ReviewModel from '@/lib/db/models/Review'
import connectDB from '@/lib/db/mongoose'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    
    const now = new Date()
    const months: Array<{ name: string; appointments: number; reviews: number }> = []
    
    // Get data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [appointments, reviews] = await Promise.all([
        AppointmentModel.countDocuments({
          date: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        }),
        ReviewModel.countDocuments({
          createdAt: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        }),
      ])
      
      months.push({
        name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        appointments,
        reviews,
      })
    }
    
    return NextResponse.json(months)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json([], { status: 500 })
  }
}



