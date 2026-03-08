import { Router } from 'express';
import { ambassadorController } from './ambassador.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const ambassadorRouter = Router();

// Public routes - Specific routes BEFORE parameterized routes
ambassadorRouter.get('/', ambassadorController.getActiveAmbassadors.bind(ambassadorController));
ambassadorRouter.get('/leaderboard', ambassadorController.getAmbassadorLeaderboard.bind(ambassadorController));

// Student routes - Must come before /:studentId to avoid "my" being treated as studentId
ambassadorRouter.post(
  '/apply',
  requireAuth,
  requireRole(['student']),
  ambassadorController.applyForAmbassador.bind(ambassadorController)
);

ambassadorRouter.get(
  '/my/application',
  requireAuth,
  requireRole(['student']),
  ambassadorController.getMyApplication.bind(ambassadorController)
);

ambassadorRouter.get(
  '/my/profile',
  requireAuth,
  requireRole(['student']),
  ambassadorController.getMyProfile.bind(ambassadorController)
);

// Admin routes - Must come before /:studentId
ambassadorRouter.get(
  '/admin/applications/pending',
  requireAuth,
  requireRole(['admin']),
  ambassadorController.getPendingApplications.bind(ambassadorController)
);

ambassadorRouter.patch(
  '/admin/applications/:applicationId/review',
  requireAuth,
  requireRole(['admin']),
  ambassadorController.reviewApplication.bind(ambassadorController)
);

ambassadorRouter.patch(
  '/admin/:ambassadorId/metrics',
  requireAuth,
  requireRole(['admin']),
  ambassadorController.updateMetrics.bind(ambassadorController)
);

ambassadorRouter.patch(
  '/admin/:ambassadorId/deactivate',
  requireAuth,
  requireRole(['admin']),
  ambassadorController.deactivateAmbassador.bind(ambassadorController)
);

ambassadorRouter.get(
  '/admin/statistics',
  requireAuth,
  requireRole(['admin']),
  ambassadorController.getStatistics.bind(ambassadorController)
);

// Parameterized route MUST be last - catches any studentId that doesn't match above routes
ambassadorRouter.get('/:studentId', ambassadorController.getAmbassadorProfile.bind(ambassadorController));
