import { Router } from 'express';
import { jobController } from './job.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// Public routes
router.get('/', jobController.getJobs.bind(jobController));

// Student routes - must come before /:jobId
router.get(
  '/applications/my-applications',
  requireAuth,
  requireRole(['student']),
  jobController.getStudentApplications.bind(jobController)
);

router.post(
  '/:jobId/apply',
  requireAuth,
  requireRole(['student']),
  jobController.applyForJob.bind(jobController)
);

// Company routes - must come before /:jobId
router.post(
  '/company/create',
  requireAuth,
  requireRole(['company']),
  jobController.createJob.bind(jobController)
);

router.get(
  '/company/my-jobs',
  requireAuth,
  requireRole(['company']),
  jobController.getCompanyJobs.bind(jobController)
);

router.put(
  '/company/:jobId',
  requireAuth,
  requireRole(['company']),
  jobController.updateJob.bind(jobController)
);

router.patch(
  '/company/:jobId/status',
  requireAuth,
  requireRole(['company']),
  jobController.updateJobStatus.bind(jobController)
);

router.delete(
  '/company/:jobId',
  requireAuth,
  requireRole(['company']),
  jobController.deleteJob.bind(jobController)
);

router.get(
  '/company/applications/all',
  requireAuth,
  requireRole(['company']),
  jobController.getCompanyApplications.bind(jobController)
);

router.get(
  '/company/:jobId/applications',
  requireAuth,
  requireRole(['company']),
  jobController.getJobApplications.bind(jobController)
);

router.patch(
  '/company/applications/:applicationId/status',
  requireAuth,
  requireRole(['company']),
  jobController.updateApplicationStatus.bind(jobController)
);

// Public route - must be last (catch-all)
router.get('/:jobId', jobController.getJobById.bind(jobController));

export const jobRouter = router;
