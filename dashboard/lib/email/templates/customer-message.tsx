import * as React from "react";

interface CustomerMessageEmailProps {
  name: string;
  message: string;
  appointmentDate?: string;
  appointmentTime?: string;
  service?: string;
}

export function CustomerMessageEmail({
  name,
  message,
  appointmentDate,
  appointmentTime,
  service,
}: CustomerMessageEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#0D0D0D",
        color: "#FAFAFA",
        padding: "10px",
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
          Message
        </p>
      </div>

      {/* Main Content Card - Squared edges */}
      <div
        style={{
          backgroundColor: "#141414",
          padding: "10px",
          border: "1px solid #3D3520",
          marginBottom: "20px",
        }}>
        <p
          style={{
            color: "#FAFAFA",
            fontSize: "18px",
            marginTop: "0",
            marginBottom: "14px",
            fontWeight: "500",
          }}>
          Hello {name},
        </p>

        {/* Message Box - Squared edges */}
        <div
          style={{
            backgroundColor: "#0D0D0D",
            padding: "14px",
            border: "1px solid #3D3520",
            marginBottom: "14px",
          }}>
          <p
            style={{
              color: "#FAFAFA",
              fontSize: "16px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              margin: "0",
            }}>
            {message}
          </p>
        </div>

        {(appointmentDate || appointmentTime || service) && (
          <div
            style={{
              marginTop: "14px",
              padding: "14px",
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
            {service && (
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
            )}
            {appointmentDate && (
              <p
                style={{
                  color: "#FAFAFA",
                  fontSize: "16px",
                  margin: "4px 0",
                  lineHeight: "1.6",
                }}>
                <strong style={{ color: "#D4AF37" }}>Date:</strong>{" "}
                <span style={{ color: "#FAFAFA" }}>
                  {new Date(appointmentDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}
            {appointmentTime && (
              <p
                style={{
                  color: "#FAFAFA",
                  fontSize: "16px",
                  margin: "4px 0",
                  lineHeight: "1.6",
                }}>
                <strong style={{ color: "#D4AF37" }}>Time:</strong>{" "}
                <span style={{ color: "#FAFAFA" }}>{appointmentTime}</span>
              </p>
            )}
          </div>
        )}
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
        If you have any questions, please don't hesitate to contact us.
      </p>
    </div>
  );
}
