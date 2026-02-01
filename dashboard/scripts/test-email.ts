// Load environment variables from .env file FIRST, before any other imports
import { config } from "dotenv";
import { resolve } from "path";

// Load .env file from the dashboard directory
config({ path: resolve(process.cwd(), ".env") });

// Now import other modules after environment variables are loaded
import { render } from "@react-email/render";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import { Resend } from "resend";
import { AppointmentNotificationEmail } from "../lib/email/templates/appointment-notification";
import { CustomerMessageEmail } from "../lib/email/templates/customer-message";

// Create Resend instance directly to ensure env vars are loaded
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const isResendConfigured = () => !!process.env.RESEND_API_KEY && !!resend;

const TEST_RECEIVER = "khalijonez777@gmail.com";
// Use Resend's test domain for testing (no verification needed)
// For production, use a verified domain like: "Zaina Hair Studio <no-reply@zainahairstudio.com>"
const TEST_SENDER = "onboarding@resend.dev";

// Preview directory for HTML files
const PREVIEW_DIR = join(process.cwd(), "email-previews");

async function savePreview(html: string, filename: string) {
  try {
    // Create preview directory if it doesn't exist
    if (!existsSync(PREVIEW_DIR)) {
      mkdirSync(PREVIEW_DIR, { recursive: true });
    }

    const filePath = join(PREVIEW_DIR, filename);
    writeFileSync(filePath, html, "utf-8");
    return filePath;
  } catch (error) {
    console.warn(`⚠️  Could not save preview file: ${error}`);
    return null;
  }
}

async function openPreview(filePath: string) {
  try {
    const { exec } = await import("child_process");
    const platform = process.platform;
    let command: string;

    if (platform === "darwin") {
      command = `open "${filePath}"`;
    } else if (platform === "win32") {
      command = `start "" "${filePath}"`;
    } else {
      command = `xdg-open "${filePath}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.warn(
          `⚠️  Could not open preview automatically: ${error.message}`
        );
        console.log(`   Preview saved at: ${filePath}`);
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not open preview: ${error}`);
  }
}

function waitForUserInput(): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("   Press Enter to continue and send the email...", () => {
      rl.close();
      resolve();
    });
  });
}

async function testCustomerMessageEmail() {
  console.log("\n📧 Testing Customer Message Email...");

  if (!isResendConfigured() || !resend) {
    console.error("❌ RESEND_API_KEY is not set. Cannot send emails.");
    console.error("   Please add RESEND_API_KEY to your .env file");
    return;
  }

  try {
    const emailHtml = await render(
      CustomerMessageEmail({
        name: "Test Customer",
        message:
          "This is a test message from Zaina Hair Studio. We're testing our email system to ensure all communications are working properly.",
        appointmentDate: new Date().toISOString().split("T")[0],
        appointmentTime: "14:00",
        service: "Hair Cut & Styling",
      })
    );

    // Save preview
    const previewPath = await savePreview(
      emailHtml,
      "customer-message-preview.html"
    );
    if (previewPath) {
      console.log(`\n👁️  Preview saved: ${previewPath}`);
      console.log("   Opening preview in browser...");
      await openPreview(previewPath);
      await waitForUserInput();
    }

    const result = await resend.emails.send({
      from: TEST_SENDER,
      to: TEST_RECEIVER,
      subject: "Test: Customer Message from Zaina Hair Studio",
      html: emailHtml,
    });

    console.log("\n📊 Full Response:", JSON.stringify(result, null, 2));

    if (result.error) {
      console.error("❌ Resend API Error:", result.error);
      throw new Error(result.error.message || "Failed to send email");
    }

    if (result.data?.id) {
      console.log("✅ Customer Message Email sent successfully!");
      console.log(`   Message ID: ${result.data.id}`);
    } else {
      console.warn("⚠️  Email may not have been sent - no message ID returned");
      console.log("   Response:", result);
    }
  } catch (error) {
    console.error("❌ Error sending Customer Message Email:", error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    }
  }
}

async function testAppointmentNotificationEmail() {
  console.log("\n📧 Testing Appointment Notification Email...");

  if (!isResendConfigured() || !resend) {
    console.error("❌ RESEND_API_KEY is not set. Cannot send emails.");
    console.error("   Please add RESEND_API_KEY to your .env file");
    return;
  }

  try {
    const emailHtml = await render(
      AppointmentNotificationEmail({
        name: "Test Customer",
        email: "joshua.albert.ansah@gmail.com",
        phone: "(555) 123-4567",
        service: "Hair Cut & Styling",
        date: new Date().toISOString().split("T")[0],
        time: "14:00",
        note: "This is a test appointment notification. Please ignore this message.",
      })
    );

    // Save preview
    const previewPath = await savePreview(
      emailHtml,
      "appointment-notification-preview.html"
    );
    if (previewPath) {
      console.log(`\n👁️  Preview saved: ${previewPath}`);
      console.log("   Opening preview in browser...");
      await openPreview(previewPath);
      await waitForUserInput();
    }

    const result = await resend.emails.send({
      from: TEST_SENDER,
      to: TEST_RECEIVER,
      subject: "Test: New Appointment Booking - Zaina Hair Studio",
      html: emailHtml,
    });

    console.log("\n📊 Full Response:", JSON.stringify(result, null, 2));

    if (result.error) {
      console.error("❌ Resend API Error:", result.error);
      throw new Error(result.error.message || "Failed to send email");
    }

    if (result.data?.id) {
      console.log("✅ Appointment Notification Email sent successfully!");
      console.log(`   Message ID: ${result.data.id}`);
    } else {
      console.warn("⚠️  Email may not have been sent - no message ID returned");
      console.log("   Response:", result);
    }
  } catch (error) {
    console.error("❌ Error sending Appointment Notification Email:", error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log("🚀 Starting Email Test Script");
  console.log("=".repeat(50));
  console.log(`📬 Receiver: ${TEST_RECEIVER}`);
  console.log(`📤 Sender: ${TEST_SENDER}`);
  console.log("=".repeat(50));

  if (!isResendConfigured()) {
    console.error("\n❌ RESEND_API_KEY is not configured in .env file");
    console.error("   Please add RESEND_API_KEY to your .env file");
    process.exit(1);
  }

  // Test Customer Message Email
  await testCustomerMessageEmail();

  // Wait a bit between emails
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test Appointment Notification Email
  await testAppointmentNotificationEmail();

  console.log("\n" + "=".repeat(50));
  console.log("✨ Email tests completed!");
  console.log(`📬 Check ${TEST_RECEIVER} for the test emails`);
  console.log("=".repeat(50));
}

// Run the tests
runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
