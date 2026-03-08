import { model, Schema, type Types } from "mongoose";

export interface CourseEnrollmentDocument {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  progressPercent: number;
  completedModules: number[];
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const courseEnrollmentSchema = new Schema<CourseEnrollmentDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedModules: {
      type: [Number],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

courseEnrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export const CourseEnrollmentModel = model<CourseEnrollmentDocument>(
  "CourseEnrollment",
  courseEnrollmentSchema
);
