import * as React from 'react'

interface ContactFormEmailProps {
  name: string
  email: string
  phone?: string
  message: string
  subject?: string
}

export function ContactFormEmail({
  name,
  email,
  phone,
  message,
  subject,
}: ContactFormEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#0D0D0D', color: '#fff', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#EC4899', fontSize: '28px', margin: '0' }}>
          New Contact Form Submission
        </h1>
      </div>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', marginTop: '0' }}>
          {subject || 'Contact Form Message'}
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
          {phone && (
            <p style={{ color: '#fff', fontSize: '16px', margin: '5px 0' }}>
              <strong>Phone:</strong> {phone}
            </p>
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#0D0D0D', borderRadius: '8px' }}>
          <p style={{ color: '#EC4899', fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            Message:
          </p>
          <p style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: '0' }}>
            {message}
          </p>
        </div>
      </div>
      
      <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '30px' }}>
        Please respond to this inquiry at your earliest convenience.
      </p>
    </div>
  )
}



