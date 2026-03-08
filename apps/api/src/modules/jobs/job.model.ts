import mongoose, { Schema, Document, Types } from 'mongoose';

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance';
export type ExperienceLevel = 'fresher' | 'junior' | 'mid-level' | 'senior' | 'lead';
export type JobStatus = 'active' | 'closed' | 'on-hold';

export interface IJob extends Document {
  companyId: Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  
  // Job details
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  experienceYears: {
    min: number;
    max: number;
  };
  
  // Compensation
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Skills and qualifications
  skills: string[];
  qualifications: string[];
  
  // Meta
  openings: number;
  status: JobStatus;
  postedBy: Types.ObjectId; // Company user who posted
  applicationDeadline?: Date;
  
  // Counters
  totalApplications: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    responsibilities: [String],
    location: {
      type: String,
      required: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid-level', 'senior', 'lead'],
      required: true,
    },
    experienceYears: {
      min: {
        type: Number,
        required: true,
        default: 0,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    skills: [String],
    qualifications: [String],
    openings: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'on-hold'],
      default: 'active',
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationDeadline: Date,
    totalApplications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ location: 1, jobType: 1 });
JobSchema.index({ 'salary.min': 1, 'salary.max': 1 });

export const JobModel = mongoose.model<IJob>('Job', JobSchema);
