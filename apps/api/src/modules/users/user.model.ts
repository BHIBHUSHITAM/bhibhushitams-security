import { model, Schema } from "mongoose";
import type { UserRole } from "../../types/auth.types";

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Index for faster email lookups
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "company", "admin"],
      default: "student",
      required: true,
      index: true, // Index for filtering by role
    },
    refreshToken: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for role-based queries with timestamps
userSchema.index({ role: 1, createdAt: -1 });

export const UserModel = model<UserDocument>("User", userSchema);
