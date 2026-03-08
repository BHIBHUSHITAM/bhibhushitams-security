import mongoose, { Schema, Document, Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';

export interface IJobApplication extends Document {
  jobId: Types.ObjectId;
  studentId: Types.ObjectId;
  companyId: Types.ObjectId;
  
  // Application details
  coverLetter?: string;
  resumeUrl?: string; // URL or path to uploaded resume
  
  // Status tracking
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: Date;
    note?: string;
  }[];
  
  // Company notes
  companyNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: String,
    resumeUrl: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    companyNotes: String,
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
JobApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
JobApplicationSchema.index({ status: 1, createdAt: -1 });

export const JobApplicationModel = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
