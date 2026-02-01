import * as React from "react";

interface AppointmentNotificationEmailProps {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  note?: string;
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
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#0D0D0D",
        color: "#FAFAFA",
        padding: "40px",
      }}>
      {/* Header with Gold Accent */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          borderBottom: "2px solid #D4AF37",
          paddingBottom: "20px",
        }}>
        <h1
          style={{
            color: "#D4AF37",
            fontSize: "32px",
            margin: "0",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}>
          Zainab's Salon
        </h1>
        <p
          style={{
            color: "#D4AF37",
            fontSize: "16px",
            margin: "10px 0 0 0",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}>
          New Appointment Booking
        </p>
      </div>

      {/* Main Content Card - Squared edges */}
      <div
        style={{
          backgroundColor: "#141414",
          padding: "20px",
          border: "1px solid #3D3520",
          marginBottom: "20px",
        }}>
        <h2
          style={{
            color: "#FAFAFA",
            fontSize: "24px",
            marginTop: "0",
            marginBottom: "12px",
            fontWeight: "600",
          }}>
          New Appointment Request
        </h2>

        {/* Customer Details - Squared edges */}
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#0D0D0D",
            border: "1px solid #3D3520",
          }}>
          <p
            style={{
              color: "#D4AF37",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
            Customer Details
          </p>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              margin: "4px 0",
              lineHeight: "1.6",
            }}>
            <strong style={{ color: "#D4AF37" }}>Name:</strong>{" "}
            <span style={{ color: "#FAFAFA" }}>{name}</span>
          </p>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              margin: "4px 0",
              lineHeight: "1.6",
            }}>
            <strong style={{ color: "#D4AF37" }}>Email:</strong>{" "}
            <span style={{ color: "#FAFAFA" }}>{email}</span>
          </p>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              margin: "4px 0",
              lineHeight: "1.6",
            }}>
            <strong style={{ color: "#D4AF37" }}>Phone:</strong>{" "}
            <span style={{ color: "#FAFAFA" }}>{phone}</span>
          </p>
        </div>

        {/* Appointment Details - Squared edges */}
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#0D0D0D",
            border: "1px solid #3D3520",
          }}>
          <p
            style={{
              color: "#D4AF37",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
            Appointment Details
          </p>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              margin: "4px 0",
              lineHeight: "1.6",
            }}>
            <strong style={{ color: "#D4AF37" }}>Service:</strong>{" "}
            <span style={{ color: "#FAFAFA" }}>{service}</span>
          </p>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              margin: "4px 0",
              lineHeight: "1.6",
            }}>
            <strong style={{ color: "#D4AF37" }}>Date:</strong>{" "}
            <span style={{ color: "#FAFAFA" }}>
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              margin: "4px 0",
              lineHeight: "1.6",
            }}>
            <strong style={{ color: "#D4AF37" }}>Time:</strong>{" "}
            <span style={{ color: "#FAFAFA" }}>{time}</span>
          </p>
          {note && (
            <p
              style={{
                color: "#FAFAFA",
                fontSize: "16px",
                margin: "8px 0",
                lineHeight: "1.6",
              }}>
              <strong style={{ color: "#D4AF37" }}>Note:</strong>{" "}
              <span style={{ color: "#FAFAFA" }}>{note}</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          color: "#A6A6A6",
          fontSize: "14px",
          textAlign: "center",
          marginTop: "40px",
          borderTop: "1px solid #3D3520",
          paddingTop: "20px",
        }}>
        Please review and manage this appointment in the admin dashboard.
      </p>
    </div>
  );
}
