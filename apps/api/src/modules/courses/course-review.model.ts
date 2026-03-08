import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICourseReview extends Document {
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  rating: number; // 1-5 stars
  comment: string;
  isVerified: boolean; // true if student completed the course
  helpful: number; // count of users who found this helpful
  createdAt: Date;
  updatedAt: Date;
}

const courseReviewSchema = new Schema<ICourseReview>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one review per student per course
courseReviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

// Index for fetching reviews by course
courseReviewSchema.index({ courseId: 1, createdAt: -1 });

export const CourseReviewModel = mongoose.model<ICourseReview>('CourseReview', courseReviewSchema);
