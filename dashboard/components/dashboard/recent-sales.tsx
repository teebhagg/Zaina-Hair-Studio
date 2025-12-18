import AppointmentModel from '@/lib/db/models/Appointment'
import connectDB from '@/lib/db/mongoose'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

async function getRecentAppointments() {
  try {
    await connectDB()
    
    const recentAppointments = await AppointmentModel.find({})
      .sort({ date: -1, time: -1, createdAt: -1 })
      .limit(10)
      .lean()

    return recentAppointments.map((apt: any) => {
      // Calculate sort date using date + time for accurate sorting
      let sortDate = 0
      if (apt.date) {
        const date = new Date(apt.date)
        if (apt.time) {
          const [hours, minutes] = apt.time.split(':').map(Number)
          date.setHours(hours, minutes, 0, 0)
        }
        sortDate = date.getTime()
      } else if (apt.createdAt) {
        sortDate = new Date(apt.createdAt).getTime()
      }
      
      return {
        id: apt._id.toString(),
        name: apt.name || apt.email || 'Unknown',
        service: apt.serviceName || apt.service || 'N/A',
        date: apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : 'N/A',
        time: apt.time || 'N/A',
        sortDate,
      }
    })
  } catch (error) {
    console.error('Error fetching recent appointments:', error)
    return []
  }
}

export async function RecentSales() {
  const appointments = await getRecentAppointments()
  
  // Sort from latest to oldest (already sorted by query, but ensure consistency)
  const sortedAppointments = appointments.sort((a, b) => b.sortDate - a.sortDate)

  if (sortedAppointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent appointments</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedAppointments.map((appointment) => (
        <div key={appointment.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{appointment.name}</p>
            <p className="text-sm text-muted-foreground">
              {appointment.service} - {appointment.date} at {appointment.time}
            </p>
          </div>
          <div className="ml-auto text-sm font-medium">
            📅
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-border/50">
        <Link href="/dashboard/appointments">
          <Button variant="ghost" className="w-full justify-between group">
            <span>See More</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
