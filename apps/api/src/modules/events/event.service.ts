import { Types } from 'mongoose';
import { EventModel, IEvent, EventType, EventStatus } from './event.model';
import { EventRegistrationModel, IEventRegistration } from './event-registration.model';

interface CreateEventInput {
  title: string;
  description: string;
  type: EventType;
  mode: 'online' | 'offline' | 'hybrid';
  startDate: Date;
  endDate: Date;
  duration: string;
  venue?: string;
  meetingLink?: string;
  maxParticipants: number;
  registrationStartDate: Date;
  registrationEndDate: Date;
  registrationFee?: number;
  agenda: string[];
  topics: string[];
  prerequisites: string[];
  benefits: string[];
  instructors: {
    name: string;
    designation: string;
    bio?: string;
  }[];
  bannerUrl?: string;
  createdBy: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  type?: EventType;
  mode?: 'online' | 'offline' | 'hybrid';
  startDate?: Date;
  endDate?: Date;
  duration?: string;
  venue?: string;
  meetingLink?: string;
  maxParticipants?: number;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  registrationFee?: number;
  agenda?: string[];
  topics?: string[];
  prerequisites?: string[];
  benefits?: string[];
  instructors?: {
    name: string;
    designation: string;
    bio?: string;
  }[];
  bannerUrl?: string;
  isPublished?: boolean;
  status?: EventStatus;
}

interface EventFilters {
  type?: EventType;
  mode?: 'online' | 'offline' | 'hybrid';
  status?: EventStatus;
  startDateFrom?: Date;
  startDateTo?: Date;
}

interface RegisterEventInput {
  eventId: string;
  studentId: string;
  notes?: string;
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

class EventService {
  // Get all events with filters
  async getEvents(filters: EventFilters = {}): Promise<IEvent[]> {
    const query: any = { isPublished: true };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.mode) {
      query.mode = filters.mode;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDateFrom || filters.startDateTo) {
      query.startDate = {};
      if (filters.startDateFrom) {
        query.startDate.$gte = filters.startDateFrom;
      }
      if (filters.startDateTo) {
        query.startDate.$lte = filters.startDateTo;
      }
    }

    return EventModel.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .exec();
  }

  // Get event by ID
  async getEventById(eventId: string): Promise<IEvent | null> {
    if (!Types.ObjectId.isValid(eventId)) {
      return null;
    }

    return EventModel.findById(eventId)
      .populate('createdBy', 'name email')
      .exec();
  }

  // Get event by slug
  async getEventBySlug(slug: string): Promise<IEvent | null> {
    return EventModel.findOne({ slug, isPublished: true })
      .populate('createdBy', 'name email')
      .exec();
  }

  // Create event (Admin only)
  async createEvent(input: CreateEventInput): Promise<IEvent> {
    let slug = generateSlug(input.title);
    
    // Ensure unique slug
    let slugExists = await EventModel.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(input.title)}-${counter}`;
      slugExists = await EventModel.findOne({ slug });
      counter++;
    }

    const event = new EventModel({
      ...input,
      slug,
      registrationFee: input.registrationFee || 0,
    });

    return event.save();
  }

  // Update event
  async updateEvent(eventId: string, updates: UpdateEventInput): Promise<IEvent | null> {
    if (!Types.ObjectId.isValid(eventId)) {
      return null;
    }

    // If title is being updated, regenerate slug
    if (updates.title) {
      let slug = generateSlug(updates.title);
      let slugExists = await EventModel.findOne({ slug, _id: { $ne: eventId } });
      let counter = 1;
      while (slugExists) {
        slug = `${generateSlug(updates.title)}-${counter}`;
        slugExists = await EventModel.findOne({ slug, _id: { $ne: eventId } });
        counter++;
      }
      (updates as any).slug = slug;
    }

    return EventModel.findByIdAndUpdate(eventId, updates, { new: true })
      .populate('createdBy', 'name email')
      .exec();
  }

  // Delete event
  async deleteEvent(eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) {
      return false;
    }

    const result = await EventModel.findByIdAndDelete(eventId);
    return !!result;
  }

  // Register for event
  async registerForEvent(input: RegisterEventInput): Promise<IEventRegistration> {
    const { eventId, studentId, notes } = input;

    if (!Types.ObjectId.isValid(eventId) || !Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid event or student ID');
    }

    // Check if event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is published
    if (!event.isPublished) {
      throw new Error('Event is not available for registration');
    }

    // Check if registration is open
    const now = new Date();
    if (now < event.registrationStartDate) {
      throw new Error('Registration has not started yet');
    }
    if (now > event.registrationEndDate) {
      throw new Error('Registration has ended');
    }

    // Check if event is already full
    if (event.totalRegistrations >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    // Check if already registered
    const existingRegistration = await EventRegistrationModel.findOne({
      eventId,
      studentId,
    });
    if (existingRegistration) {
      throw new Error('Already registered for this event');
    }

    // Create registration
    const registration = new EventRegistrationModel({
      eventId,
      studentId,
      notes,
      paymentAmount: event.registrationFee,
      paymentStatus: event.registrationFee === 0 ? 'completed' : 'pending',
    });

    await registration.save();

    // Increment total registrations
    event.totalRegistrations += 1;
    await event.save();

    return registration;
  }

  // Cancel registration
  async cancelRegistration(registrationId: string, studentId: string): Promise<IEventRegistration | null> {
    if (!Types.ObjectId.isValid(registrationId) || !Types.ObjectId.isValid(studentId)) {
      return null;
    }

    const registration = await EventRegistrationModel.findOne({
      _id: registrationId,
      studentId,
    });

    if (!registration) {
      return null;
    }

    // Update status
    registration.status = 'cancelled';
    await registration.save();

    // Decrement total registrations
    await EventModel.findByIdAndUpdate(registration.eventId, {
      $inc: { totalRegistrations: -1 },
    });

    return registration;
  }

  // Get student's registrations
  async getStudentRegistrations(studentId: string): Promise<IEventRegistration[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      return [];
    }

    return EventRegistrationModel.find({ studentId })
      .populate({
        path: 'eventId',
        select: 'title slug type mode startDate endDate venue meetingLink bannerUrl status',
      })
      .sort({ registrationDate: -1 })
      .exec();
  }

  // Get event registrations (Admin only)
  async getEventRegistrations(eventId: string): Promise<IEventRegistration[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      return [];
    }

    return EventRegistrationModel.find({ eventId })
      .populate('studentId', 'name email')
      .sort({ registrationDate: -1 })
      .exec();
  }

  // Get all events created by admin
  async getAdminEvents(adminId: string): Promise<IEvent[]> {
    if (!Types.ObjectId.isValid(adminId)) {
      return [];
    }

    return EventModel.find({ createdBy: adminId })
      .sort({ startDate: -1 })
      .exec();
  }

  // Mark attendance
  async markAttendance(registrationId: string, attended: boolean): Promise<IEventRegistration | null> {
    if (!Types.ObjectId.isValid(registrationId)) {
      return null;
    }

    return EventRegistrationModel.findByIdAndUpdate(
      registrationId,
      {
        attendanceMarked: true,
        attendanceDate: new Date(),
        status: attended ? 'attended' : 'no-show',
      },
      { new: true }
    ).exec();
  }
}

export const eventService = new EventService();
