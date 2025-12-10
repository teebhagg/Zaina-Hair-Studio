import bcrypt from "bcryptjs";
import mongoose, { Schema, model, models } from "mongoose";

/**
 * Admin Model
 *
 * This model is ONLY for Zainab (the administrator).
 * - Only one admin user is allowed
 * - Has password for dashboard login
 * - Customers are stored separately in the Customer collection
 *
 * Customers do NOT have Admin accounts - they are created automatically
 * when booking appointments and stored in the Customer collection.
 */
export interface IAdmin extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one admin user exists (Zainab)
AdminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingAdmin = await mongoose.model("Admin").findOne();
    if (existingAdmin && existingAdmin._id.toString() !== this._id.toString()) {
      return next(
        new Error(
          "Only one admin user (Zainab) is allowed. Admin already exists."
        )
      );
    }
  }
  next();
});

// Hash password before saving (only if password is modified)
AdminSchema.pre("save", async function (next) {
  // Skip hashing if password hasn't changed or is already hashed
  if (!this.isModified("password")) return next();

  // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (this.password.startsWith("$2")) {
    return next();
  }

  // Hash the password using bcrypt with 12 salt rounds
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare provided password with hashed password using bcrypt
// This method uses bcrypt.compare() to securely verify the password
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Handle Edge runtime where models might be undefined
// In Edge runtime, models is undefined, so we need to check for it
let Admin: mongoose.Model<IAdmin>;

try {
  if (typeof models !== "undefined" && models && models.Admin) {
    Admin = models.Admin as mongoose.Model<IAdmin>;
  } else {
    Admin = model<IAdmin>("Admin", AdminSchema);
  }
} catch (error) {
  // Fallback for Edge runtime - create model directly
  Admin = model<IAdmin>("Admin", AdminSchema);
}

export default Admin;
