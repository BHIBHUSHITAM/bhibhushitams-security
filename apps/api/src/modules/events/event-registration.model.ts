import mongoose, { Schema, Document, Types } from 'mongoose';

export type RegistrationStatus = 'registered' | 'attended' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IEventRegistration extends Document {
  eventId: Types.ObjectId;
  studentId: Types.ObjectId;
  
  // Registration details
  registrationDate: Date;
  status: RegistrationStatus;
  
  // Payment (if applicable)
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentId?: string;
  
  // Additional info
  notes?: string; // Student's notes/questions
  
  // Attendance (for tracking)
  attendanceMarked: boolean;
  attendanceDate?: Date;
  
  // Certificate
  certificateIssued: boolean;
  certificateId?: Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled', 'no-show'],
      default: 'registered',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed', // Default to completed for free events
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    paymentId: String,
    notes: String,
    attendanceMarked: {
      type: Boolean,
      default: false,
    },
    attendanceDate: Date,
    certificateIssued: {
      type: Boolean,
      default: false,
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

// Compound index to prevent duplicate registrations
EventRegistrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });
EventRegistrationSchema.index({ studentId: 1, status: 1 });
EventRegistrationSchema.index({ eventId: 1, status: 1 });

export const EventRegistrationModel = mongoose.model<IEventRegistration>(
  'EventRegistration',
  EventRegistrationSchema
);
