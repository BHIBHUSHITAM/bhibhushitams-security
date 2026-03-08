import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const dashboardRouter = Router();

// Student dashboard
dashboardRouter.get(
  '/student',
  requireAuth,
  requireRole(['student', 'admin']),
  dashboardController.getStudentDashboard.bind(dashboardController)
);

// Admin dashboard
dashboardRouter.get(
  '/admin',
  requireAuth,
  requireRole(['admin']),
  dashboardController.getAdminDashboard.bind(dashboardController)
);
