// Load environment variables from .env file FIRST, before any other imports
import { config } from "dotenv";
import { resolve } from "path";

// Load .env file from the dashboard directory
config({ path: resolve(process.cwd(), ".env") });

// Now import other modules after environment variables are loaded
import bcrypt from "bcryptjs";
import Admin from "../lib/db/models/Admin";
import connectDB from "../lib/db/mongoose";

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Zainab's admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || "zainab@zainabssalon.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Password@123";
    const adminName = process.env.ADMIN_NAME || "Zainab Adeshola";

    // Check if admin already exists (only one admin allowed)
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      console.log(`Admin user (${existingAdmin.name}) already exists`);
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Hash the password using bcrypt with salt rounds of 10
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log("Password hashed successfully using bcrypt");

    // Create Zainab as the only administrator
    const admin = new Admin({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
    });

    // Save the user (the pre-save hook will check if password is modified,
    // but since we already hashed it, it won't hash again)
    await admin.save();
    console.log("✅ Admin user (Zainab) created successfully");
    console.log(`Name: ${adminName}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword} (hashed with bcrypt)`);
    console.log("⚠️  Please change the password after first login!");
    console.log(
      "\n📝 Note: Only one admin user is allowed. Customers are stored separately in the Customer collection."
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      console.log(
        "\nℹ️  Admin user already exists. Only one admin (Zainab) is allowed."
      );
    }
    process.exit(1);
  }
}

seed();
