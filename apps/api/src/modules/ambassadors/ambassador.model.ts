import mongoose, { Schema, Document, Types } from 'mongoose';

export type AmbassadorTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AmbassadorStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

export interface IAmbassadorApplication extends Document {
  studentId: Types.ObjectId;
  email: string;
  college: string;
  department: string;
  batch: string;

  // Application details
  whyAmbassador: string; // Why they want to be ambassador
  experience: string; // Relevant experience
  goals: string; // What they want to achieve
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };

  // Status
  status: AmbassadorStatus;
  appliedDate: Date;
  reviewedDate?: Date;
  reviewedBy?: Types.ObjectId; // Admin who reviewed

  // Approval details
  assignedTier?: AmbassadorTier;
  adminNotes?: string;
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AmbassadorApplicationSchema = new Schema<IAmbassadorApplication>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },
    whyAmbassador: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    goals: {
      type: String,
      required: true,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      instagram: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
      default: 'pending',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    reviewedDate: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
    },
    adminNotes: String,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
AmbassadorApplicationSchema.index({ studentId: 1 });
AmbassadorApplicationSchema.index({ status: 1 });
AmbassadorApplicationSchema.index({ appliedDate: -1 });

export const AmbassadorApplicationModel = mongoose.model<IAmbassadorApplication>(
  'AmbassadorApplication',
  AmbassadorApplicationSchema
);

// Ambassador Profile Model
export interface IAmbassador extends Document {
  studentId: Types.ObjectId;
  tier: AmbassadorTier;
  college: string;
  department: string;
  bio: string;

  // Performance metrics
  eventsOrganized: number;
  studentsRecruited: number;
  totalReach: number;
  engagementScore: number; // 0-100

  // Activity
  approvalDate: Date;
  lastActivityDate: Date;
  isActive: boolean;

  // Contact & Social
  email: string;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };

  // Certificate
  certificateId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const AmbassadorSchema = new Schema<IAmbassador>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    college: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    eventsOrganized: {
      type: Number,
      default: 0,
    },
    studentsRecruited: {
      type: Number,
      default: 0,
    },
    totalReach: {
      type: Number,
      default: 0,
    },
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    approvalDate: {
      type: Date,
      default: Date.now,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      instagram: String,
    },
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AmbassadorSchema.index({ tier: 1, isActive: 1 });
AmbassadorSchema.index({ engagementScore: -1 });
AmbassadorSchema.index({ college: 1 });
AmbassadorSchema.index({ approvalDate: -1 });

export const AmbassadorModel = mongoose.model<IAmbassador>(
  'Ambassador',
  AmbassadorSchema
);
