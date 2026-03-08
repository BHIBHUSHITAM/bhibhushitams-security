import { Request, Response } from 'express';
import { z } from 'zod';
import { ambassadorService } from './ambassador.service';

// Validation schemas
const applyForAmbassadorSchema = z.object({
  college: z.string().min(2),
  department: z.string().min(2),
  batch: z.string(),
  whyAmbassador: z.string().min(20),
  experience: z.string().min(10),
  goals: z.string().min(20),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }).optional(),
});

const reviewApplicationSchema = z.object({
  approved: z.boolean(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

const updateMetricsSchema = z.object({
  eventsOrganized: z.number().int().min(0).optional(),
  studentsRecruited: z.number().int().min(0).optional(),
  totalReach: z.number().int().min(0).optional(),
});

class AmbassadorController {
  // Apply for ambassador program (Student only)
  async applyForAmbassador(req: Request, res: Response) {
    try {
      const validated = applyForAmbassadorSchema.parse(req.body);

      const application = await ambassadorService.applyForAmbassador({
        studentId: req.user!.id,
        email: req.user!.email,
        ...validated,
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
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

  // Get student's application status
  async getMyApplication(req: Request, res: Response) {
    try {
      const application = await ambassadorService.getStudentApplication(req.user!.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'No application found',
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application',
        error: error.message,
      });
    }
  }

  // Get pending applications (Admin only)
  async getPendingApplications(req: Request, res: Response) {
    try {
      const applications = await ambassadorService.getPendingApplications();

      res.json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message,
      });
    }
  }

  // Review application (Admin only)
  async reviewApplication(req: Request, res: Response) {
    try {
      const applicationId = Array.isArray(req.params.applicationId)
        ? req.params.applicationId[0]
        : req.params.applicationId;
      const validated = reviewApplicationSchema.parse(req.body);

      const application = await ambassadorService.reviewApplication(
        { applicationId, ...validated },
        req.user!.id
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      res.json({
        success: true,
        message: validated.approved ? 'Application approved' : 'Application rejected',
        data: application,
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
        message: 'Failed to review application',
        error: error.message,
      });
    }
  }

  // Get ambassador profile (Public)
  async getAmbassadorProfile(req: Request, res: Response) {
    try {
      const studentId = Array.isArray(req.params.studentId)
        ? req.params.studentId[0]
        : req.params.studentId;

      const profile = await ambassadorService.getAmbassadorProfile(studentId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Ambassador not found',
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ambassador',
        error: error.message,
      });
    }
  }

  // Get active ambassadors (Public)
  async getActiveAmbassadors(req: Request, res: Response) {
    try {
      const { tier, college, department } = req.query;

      const ambassadors = await ambassadorService.getActiveAmbassadors({
        tier: tier as any,
        college: college as string,
        department: department as string,
      });

      res.json({
        success: true,
        data: ambassadors,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ambassadors',
        error: error.message,
      });
    }
  }

  // Get ambassador leaderboard (Public)
  async getAmbassadorLeaderboard(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      const leaderboard = await ambassadorService.getAmbassadorLeaderboard(limit);

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message,
      });
    }
  }

  // Get my ambassador profile (Student who is ambassador)
  async getMyProfile(req: Request, res: Response) {
    try {
      const profile = await ambassadorService.getAmbassadorProfile(req.user!.id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'You are not an ambassador',
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message,
      });
    }
  }

  // Update ambassador metrics (Admin only)
  async updateMetrics(req: Request, res: Response) {
    try {
      const ambassadorId = Array.isArray(req.params.ambassadorId)
        ? req.params.ambassadorId[0]
        : req.params.ambassadorId;
      const validated = updateMetricsSchema.parse(req.body);

      const ambassador = await ambassadorService.updateAmbassadorMetrics({
        ambassadorId,
        ...validated,
      });

      if (!ambassador) {
        return res.status(404).json({
          success: false,
          message: 'Ambassador not found',
        });
      }

      res.json({
        success: true,
        message: 'Metrics updated successfully',
        data: ambassador,
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
        message: 'Failed to update metrics',
        error: error.message,
      });
    }
  }

  // Deactivate ambassador (Admin only)
  async deactivateAmbassador(req: Request, res: Response) {
    try {
      const ambassadorId = Array.isArray(req.params.ambassadorId)
        ? req.params.ambassadorId[0]
        : req.params.ambassadorId;

      const ambassador = await ambassadorService.deactivateAmbassador(ambassadorId);

      if (!ambassador) {
        return res.status(404).json({
          success: false,
          message: 'Ambassador not found',
        });
      }

      res.json({
        success: true,
        message: 'Ambassador deactivated',
        data: ambassador,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate ambassador',
        error: error.message,
      });
    }
  }

  // Get ambassador statistics (Admin only)
  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await ambassadorService.getAmbassadorStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message,
      });
    }
  }
}

export const ambassadorController = new AmbassadorController();
