import { model, Schema, type Types } from "mongoose";

export interface InternshipApplicationDocument {
  _id: Types.ObjectId;
  internshipId: Types.ObjectId;
  studentId: Types.ObjectId;
  resumeUrl: string;
  coverLetter?: string;
  status: "applied" | "under-review" | "shortlisted" | "rejected" | "selected";
  createdAt: Date;
  updatedAt: Date;
}

const internshipApplicationSchema = new Schema<InternshipApplicationDocument>(
  {
    internshipId: {
      type: Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    coverLetter: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "under-review", "shortlisted", "rejected", "selected"],
      default: "applied",
      required: true,
    },
  },
  { timestamps: true }
);

internshipApplicationSchema.index({ internshipId: 1, studentId: 1 }, { unique: true });

export const InternshipApplicationModel = model<InternshipApplicationDocument>(
  "InternshipApplication",
  internshipApplicationSchema
);
