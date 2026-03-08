import mongoose, { Schema, Document, Types } from 'mongoose';

export type CertificateType = 'course' | 'internship' | 'event';
export type CertificateStatus = 'active' | 'revoked';

export interface ICertificate extends Document {
  certificateId: string; // Unique public ID (e.g., CERT-20260307-ABCD1234)
  studentId: Types.ObjectId;
  type: CertificateType;
  
  // References (only one should be populated based on type)
  courseId?: Types.ObjectId;
  internshipId?: Types.ObjectId;
  eventId?: Types.ObjectId;
  
  // Certificate details
  title: string; // e.g., "Web Application Security Course Completion"
  description?: string;
  issueDate: Date;
  status: CertificateStatus;
  
  // QR Code data
  qrCodeUrl: string; // Data URL of the QR code image
  verificationUrl: string; // Public URL to verify this certificate
  
  // PDF data (stored as base64 or file reference)
  pdfUrl?: string; // URL or path to the certificate PDF
  
  // Metadata
  issuedBy: Types.ObjectId; // Admin who issued the certificate
  metadata?: {
    completionDate?: Date;
    grade?: string;
    score?: number;
    duration?: string;
    skills?: string[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['course', 'internship', 'event'],
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    internshipId: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    issueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    qrCodeUrl: {
      type: String,
      required: true,
    },
    verificationUrl: {
      type: String,
      required: true,
    },
    pdfUrl: String,
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      completionDate: Date,
      grade: String,
      score: Number,
      duration: String,
      skills: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
CertificateSchema.index({ studentId: 1, type: 1 });
CertificateSchema.index({ certificateId: 1, status: 1 });

export const CertificateModel = mongoose.model<ICertificate>('Certificate', CertificateSchema);
