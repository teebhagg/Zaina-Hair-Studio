import { AppointmentForm } from '@/components/booking/AppointmentForm'

export default function BookPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Book an Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Fill out the form below to schedule your visit
          </p>
        </div>
        <AppointmentForm />
      </div>
    </div>
  )
}

