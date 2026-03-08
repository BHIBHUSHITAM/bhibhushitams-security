import { model, Schema, type Types } from "mongoose";

export interface InternshipDocument {
  _id: Types.ObjectId;
  title: string;
  companyName: string;
  location: string;
  mode: "remote" | "hybrid" | "onsite";
  stipend: string;
  durationWeeks: number;
  skills: string[];
  description: string;
  status: "open" | "closed";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const internshipSchema = new Schema<InternshipDocument>(
  {
    title: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "remote",
      required: true,
    },
    stipend: { type: String, required: true, trim: true },
    durationWeeks: { type: Number, required: true, min: 1 },
    skills: { type: [String], default: [] },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
internshipSchema.index({ status: 1, createdAt: -1 });
internshipSchema.index({ companyName: 1 });
internshipSchema.index({ mode: 1 });
internshipSchema.index({ createdBy: 1 });

export const InternshipModel = model<InternshipDocument>("Internship", internshipSchema);
