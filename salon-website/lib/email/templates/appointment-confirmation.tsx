import * as React from 'react'

interface AppointmentConfirmationEmailProps {
  name: string
  service: string
  date: string
  time: string
}

export function AppointmentConfirmationEmail({
  name,
  service,
  date,
  time,
}: AppointmentConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#0D0D0D', color: '#fff', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#EC4899', fontSize: '28px', margin: '0' }}>
          Zainab&apos;s Adeshola Salon
        </h1>
      </div>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', marginTop: '0' }}>
          Appointment Confirmed!
        </h2>
        
        <p style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6' }}>
          Hi {name},
        </p>
        
        <p style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6' }}>
          Your appointment has been confirmed. We&apos;re excited to see you!
        </p>
        
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#0D0D0D', borderRadius: '8px' }}>
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
        </div>
      </div>
      
      <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '30px' }}>
        If you need to reschedule or cancel, please contact us at least 24 hours in advance.
      </p>
      
      <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
        © {new Date().getFullYear()} Zainab&apos;s Adeshola Salon. All rights reserved.
      </p>
    </div>
  )
}

