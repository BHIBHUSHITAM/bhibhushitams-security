import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

class DashboardController {
  /**
   * Get student dashboard statistics
   */
  async getStudentDashboard(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const stats = await dashboardService.getStudentDashboardStats(req.user.id);

      res.json({ stats });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminDashboard(_req: Request, res: Response) {
    try {
      const stats = await dashboardService.getAdminDashboardStats();

      res.json({ stats });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const dashboardController = new DashboardController();
