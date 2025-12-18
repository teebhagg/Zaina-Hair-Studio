import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Calendar,
    MessageSquare,
} from 'lucide-react'
import AppointmentModel from '@/lib/db/models/Appointment'
import ReviewModel from '@/lib/db/models/Review'
import connectDB from '@/lib/db/mongoose'

async function getStats() {
  try {
    await connectDB()
    
    const [totalAppointments, totalReviews, todayAppointments, recentReviews] = await Promise.all([
      AppointmentModel.countDocuments(),
      ReviewModel.countDocuments(),
      AppointmentModel.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      ReviewModel.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      }),
    ])

    return {
      totalAppointments,
      totalReviews,
      todayAppointments,
      recentReviews,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalAppointments: 0,
      totalReviews: 0,
      todayAppointments: 0,
      recentReviews: 0,
    }
  }
}

export async function StatsCards() {
  const stats = await getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Appointments
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.todayAppointments} today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Reviews
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReviews}</div>
          <p className="text-xs text-muted-foreground">
            {stats.recentReviews} in last 7 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Appointments
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Scheduled for today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Reviews
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentReviews}</div>
          <p className="text-xs text-muted-foreground">
            In the last 7 days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
