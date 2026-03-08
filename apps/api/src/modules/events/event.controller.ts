import { Request, Response } from 'express';
import { z } from 'zod';
import { eventService } from './event.service';

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(['workshop', 'hackathon', 'bootcamp', 'webinar']),
  mode: z.enum(['online', 'offline', 'hybrid']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  duration: z.string(),
  venue: z.string().optional(),
  meetingLink: z.string().url().optional(),
  maxParticipants: z.number().int().positive(),
  registrationStartDate: z.string().datetime(),
  registrationEndDate: z.string().datetime(),
  registrationFee: z.number().min(0).optional(),
  agenda: z.array(z.string()),
  topics: z.array(z.string()),
  prerequisites: z.array(z.string()),
  benefits: z.array(z.string()),
  instructors: z.array(
    z.object({
      name: z.string(),
      designation: z.string(),
      bio: z.string().optional(),
    })
  ),
  bannerUrl: z.string().url().optional(),
});

const updateEventSchema = createEventSchema.partial();

const registerEventSchema = z.object({
  notes: z.string().max(500).optional(),
});

class EventController {
  // Get all events (Public)
  async getEvents(req: Request, res: Response) {
    try {
      const { type, mode, status, startDateFrom, startDateTo } = req.query;

      const filters: any = {};

      if (type) filters.type = type;
      if (mode) filters.mode = mode;
      if (status) filters.status = status;
      if (startDateFrom) filters.startDateFrom = new Date(startDateFrom as string);
      if (startDateTo) filters.startDateTo = new Date(startDateTo as string);

      const events = await eventService.getEvents(filters);

      res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message,
      });
    }
  }

  // Get event by ID (Public)
  async getEventById(req: Request, res: Response) {
    try {
      const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;

      const event = await eventService.getEventById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error.message,
      });
    }
  }

  // Get event by slug (Public)
  async getEventBySlug(req: Request, res: Response) {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

      const event = await eventService.getEventBySlug(slug);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error.message,
      });
    }
  }

  // Create event (Admin only)
  async createEvent(req: Request, res: Response) {
    try {
      const validated = createEventSchema.parse(req.body);

      const event = await eventService.createEvent({
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        registrationStartDate: new Date(validated.registrationStartDate),
        registrationEndDate: new Date(validated.registrationEndDate),
        createdBy: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error.message,
      });
    }
  }

  // Update event (Admin only)
  async updateEvent(req: Request, res: Response) {
    try {
      const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;
      const validated = updateEventSchema.parse(req.body);

      const updates: any = { ...validated };
      
      // Convert date strings to Date objects
      if (validated.startDate) updates.startDate = new Date(validated.startDate);
      if (validated.endDate) updates.endDate = new Date(validated.endDate);
      if (validated.registrationStartDate) updates.registrationStartDate = new Date(validated.registrationStartDate);
      if (validated.registrationEndDate) updates.registrationEndDate = new Date(validated.registrationEndDate);

      const event = await eventService.updateEvent(eventId, updates);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: event,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error.message,
      });
    }
  }

  // Delete event (Admin only)
  async deleteEvent(req: Request, res: Response) {
    try {
      const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;

      const success = await eventService.deleteEvent(eventId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error.message,
      });
    }
  }

  // Register for event (Student only)
  async registerForEvent(req: Request, res: Response) {
    try {
      const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;
      const validated = registerEventSchema.parse(req.body);

      const registration = await eventService.registerForEvent({
        eventId,
        studentId: req.user!.id,
        notes: validated.notes,
      });

      res.status(201).json({
        success: true,
        message: 'Successfully registered for event',
        data: registration,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
      }

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cancel registration (Student only)
  async cancelRegistration(req: Request, res: Response) {
    try {
      const registrationId = Array.isArray(req.params.registrationId) ? req.params.registrationId[0] : req.params.registrationId;

      const registration = await eventService.cancelRegistration(
        registrationId,
        req.user!.id
      );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      res.json({
        success: true,
        message: 'Registration cancelled successfully',
        data: registration,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel registration',
        error: error.message,
      });
    }
  }

  // Get student's registrations
  async getStudentRegistrations(req: Request, res: Response) {
    try {
      const registrations = await eventService.getStudentRegistrations(req.user!.id);

      res.json({
        success: true,
        data: registrations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: error.message,
      });
    }
  }

  // Get event registrations (Admin only)
  async getEventRegistrations(req: Request, res: Response) {
    try {
      const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;

      const registrations = await eventService.getEventRegistrations(eventId);

      res.json({
        success: true,
        data: registrations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event registrations',
        error: error.message,
      });
    }
  }

  // Get admin's events
  async getAdminEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAdminEvents(req.user!.id);

      res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message,
      });
    }
  }

  // Mark attendance (Admin only)
  async markAttendance(req: Request, res: Response) {
    try {
      const registrationId = Array.isArray(req.params.registrationId) ? req.params.registrationId[0] : req.params.registrationId;
      const { attended } = req.body;

      if (typeof attended !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'attended field must be a boolean',
        });
      }

      const registration = await eventService.markAttendance(registrationId, attended);

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      res.json({
        success: true,
        message: 'Attendance marked successfully',
        data: registration,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark attendance',
        error: error.message,
      });
    }
  }
}

export const eventController = new EventController();
