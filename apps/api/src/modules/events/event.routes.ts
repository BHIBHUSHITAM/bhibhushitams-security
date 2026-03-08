import { Router } from 'express';
import { eventController } from './event.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// Public routes - Specific routes MUST come before parameterized routes
router.get('/', eventController.getEvents.bind(eventController));
router.get('/slug/:slug', eventController.getEventBySlug.bind(eventController));
router.get('/:eventId', eventController.getEventById.bind(eventController));

// Student routes
router.post(
  '/:eventId/register',
  requireAuth,
  requireRole(['student']),
  eventController.registerForEvent.bind(eventController)
);

router.patch(
  '/registrations/:registrationId/cancel',
  requireAuth,
  requireRole(['student']),
  eventController.cancelRegistration.bind(eventController)
);

router.get(
  '/registrations/my-registrations',
  requireAuth,
  requireRole(['student']),
  eventController.getStudentRegistrations.bind(eventController)
);

// Admin routes
router.post(
  '/admin/create',
  requireAuth,
  requireRole(['admin']),
  eventController.createEvent.bind(eventController)
);

router.get(
  '/admin/my-events',
  requireAuth,
  requireRole(['admin']),
  eventController.getAdminEvents.bind(eventController)
);

router.put(
  '/admin/:eventId',
  requireAuth,
  requireRole(['admin']),
  eventController.updateEvent.bind(eventController)
);

router.delete(
  '/admin/:eventId',
  requireAuth,
  requireRole(['admin']),
  eventController.deleteEvent.bind(eventController)
);

router.get(
  '/admin/:eventId/registrations',
  requireAuth,
  requireRole(['admin']),
  eventController.getEventRegistrations.bind(eventController)
);

router.patch(
  '/admin/registrations/:registrationId/attendance',
  requireAuth,
  requireRole(['admin']),
  eventController.markAttendance.bind(eventController)
);

export const eventRouter = router;
