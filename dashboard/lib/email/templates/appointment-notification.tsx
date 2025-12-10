import * as React from 'react'

interface AppointmentNotificationEmailProps {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  note?: string
}

export function AppointmentNotificationEmail({
  name,
  email,
  phone,
  service,
  date,
  time,
  note,
}: AppointmentNotificationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#0D0D0D', color: '#fff', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#EC4899', fontSize: '28px', margin: '0' }}>
          New Appointment Booking
        </h1>
      </div>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', marginTop: '0' }}>
          New Appointment Request
        </h2>
        
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0D0D0D', borderRadius: '8px' }}>
          <p style={{ color: '#EC4899', fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            Customer Details:
          </p>
          <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
            <strong>Name:</strong> {name}
          </p>
          <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
            <strong>Email:</strong> {email}
          </p>
          <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
            <strong>Phone:</strong> {phone}
          </p>
        </div>

        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0D0D0D', borderRadius: '8px' }}>
          <p style={{ color: '#EC4899', fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            Appointment Details:
          </p>
          <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
            <strong>Service:</strong> {service}
          </p>
          <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
            <strong>Date:</strong> {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
            <strong>Time:</strong> {time}
          </p>
          {note && (
            <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
              <strong>Note:</strong> {note}
            </p>
          )}
        </div>
      </div>
      
      <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '30px' }}>
        Please review and manage this appointment in the admin dashboard.
      </p>
    </div>
  )
}

