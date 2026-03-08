import mongoose, { Schema, Document, Types } from 'mongoose';

export type EventType = 'workshop' | 'hackathon' | 'bootcamp' | 'webinar';
export type EventMode = 'online' | 'offline' | 'hybrid';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  type: EventType;
  mode: EventMode;
  
  // Event details
  startDate: Date;
  endDate: Date;
  duration: string; // e.g., "3 days", "2 hours"
  
  // Location
  venue?: string; // For offline/hybrid events
  meetingLink?: string; // For online/hybrid events
  
  // Registration
  maxParticipants: number;
  registrationStartDate: Date;
  registrationEndDate: Date;
  registrationFee: number; // 0 for free events
  
  // Content
  agenda: string[];
  topics: string[];
  prerequisites: string[];
  benefits: string[];
  
  // Instructors/Speakers
  instructors: {
    name: string;
    designation: string;
    bio?: string;
  }[];
  
  // Media
  bannerUrl?: string;
  
  // Meta
  isPublished: boolean;
  status: EventStatus;
  createdBy: Types.ObjectId; // Admin who created
  
  // Counters
  totalRegistrations: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['workshop', 'hackathon', 'bootcamp', 'webinar'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    venue: String,
    meetingLink: String,
    maxParticipants: {
      type: Number,
      required: true,
    },
    registrationStartDate: {
      type: Date,
      required: true,
    },
    registrationEndDate: {
      type: Date,
      required: true,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    agenda: [String],
    topics: [String],
    prerequisites: [String],
    benefits: [String],
    instructors: [
      {
        name: String,
        designation: String,
        bio: String,
      },
    ],
    bannerUrl: String,
    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalRegistrations: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventSchema.index({ slug: 1 });
EventSchema.index({ type: 1, status: 1 });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ isPublished: 1, status: 1 });

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);
