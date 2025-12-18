import * as React from 'react'

interface CustomerMessageEmailProps {
  name: string
  message: string
  appointmentDate?: string
  appointmentTime?: string
  service?: string
}

export function CustomerMessageEmail({
  name,
  message,
  appointmentDate,
  appointmentTime,
  service,
}: CustomerMessageEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#0D0D0D', color: '#fff', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#EC4899', fontSize: '28px', margin: '0' }}>
          Message from Zainab's Salon
        </h1>
      </div>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
        <p style={{ color: '#fff', fontSize: '18px', marginTop: '0', marginBottom: '20px' }}>
          Hello {name},
        </p>
        
        <div style={{ backgroundColor: '#0D0D0D', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: '0' }}>
            {message}
          </p>
        </div>

        {(appointmentDate || appointmentTime || service) && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0D0D0D', borderRadius: '8px' }}>
            <p style={{ color: '#EC4899', fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Appointment Details:
            </p>
            {service && (
              <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
                <strong>Service:</strong> {service}
              </p>
            )}
            {appointmentDate && (
              <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
                <strong>Date:</strong> {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            {appointmentTime && (
              <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
                <strong>Time:</strong> {appointmentTime}
              </p>
            )}
          </div>
        )}
      </div>
      
      <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '30px' }}>
        If you have any questions, please don't hesitate to contact us.
      </p>
    </div>
  )
}



