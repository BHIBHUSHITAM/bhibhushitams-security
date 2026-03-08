import { model, Schema, type Types } from "mongoose";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CourseModule {
  title: string;
  duration: string;
  topics: string[];
  videoUrl?: string;
}

export interface CourseDocument {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  level: CourseLevel;
  duration: string;
  thumbnail?: string;
  price: number;
  modules: CourseModule[];
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseModuleSchema = new Schema<CourseModule>({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  topics: { type: [String], default: [] },
  videoUrl: { type: String, required: false },
});

const courseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true, // Index for slug lookups
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      required: true,
      index: true, // Index for filtering by level
    },
    duration: { type: String, required: true },
    thumbnail: { type: String, required: false },
    price: { type: Number, default: 0, min: 0 },
    modules: { type: [courseModuleSchema], default: [] },
    description: { type: String, required: true },
    isPublished: { 
      type: Boolean, 
      default: true, 
      required: true,
      index: true, // Index for published filter
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
courseSchema.index({ isPublished: 1, level: 1 });
courseSchema.index({ isPublished: 1, price: 1 });

export const CourseModel = model<CourseDocument>("Course", courseSchema);
