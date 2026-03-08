import { Router } from 'express';
import { certificateController } from './certificate.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// Public routes
router.get('/verify/:certificateId', certificateController.verifyCertificate.bind(certificateController));
router.get('/download/:certificateId', certificateController.downloadCertificate.bind(certificateController));

// Student routes
router.get(
  '/my-certificates',
  requireAuth,
  requireRole(['student']),
  certificateController.getStudentCertificates.bind(certificateController)
);

// Admin routes
router.post(
  '/',
  requireAuth,
  requireRole(['admin']),
  certificateController.createCertificate.bind(certificateController)
);

router.get(
  '/all',
  requireAuth,
  requireRole(['admin']),
  certificateController.getAllCertificates.bind(certificateController)
);

router.patch(
  '/revoke/:certificateId',
  requireAuth,
  requireRole(['admin']),
  certificateController.revokeCertificate.bind(certificateController)
);

export const certificateRouter = router;
