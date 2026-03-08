import { Request, Response } from 'express';
import { z } from 'zod';
import { certificateService } from './certificate.service';

// Validation schemas
const createCertificateSchema = z.object({
  studentId: z.string(),
  type: z.enum(['course', 'internship', 'event']),
  courseId: z.string().optional(),
  internshipId: z.string().optional(),
  eventId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  metadata: z.object({
    completionDate: z.string().optional(),
    grade: z.string().optional(),
    score: z.number().optional(),
    duration: z.string().optional(),
    skills: z.array(z.string()).optional(),
  }).optional(),
});

export class CertificateController {
  /**
   * Create a new certificate (Admin only)
   */
  async createCertificate(req: Request, res: Response) {
    try {
      const validatedData = createCertificateSchema.parse(req.body);
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Prepare metadata with proper Date conversion
      const metadata = validatedData.metadata ? {
        ...validatedData.metadata,
        completionDate: validatedData.metadata.completionDate 
          ? new Date(validatedData.metadata.completionDate)
          : undefined,
      } : undefined;

      const certificate = await certificateService.createCertificate({
        ...validatedData,
        metadata,
        issuedBy: adminId,
      });

      res.status(201).json({
        message: 'Certificate created successfully',
        certificate,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Verify a certificate (Public)
   */
  async verifyCertificate(req: Request, res: Response) {
    try {
      const certificateId = Array.isArray(req.params.certificateId) 
        ? req.params.certificateId[0] 
        : req.params.certificateId;

      const verification = await certificateService.verifyCertificate(certificateId);

      if (!verification) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      res.json({
        message: 'Certificate verified',
        certificate: verification,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get student's certificates
   */
  async getStudentCertificates(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;

      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const certificates = await certificateService.getStudentCertificates(studentId);

      res.json({
        message: 'Certificates fetched successfully',
        certificates,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all certificates (Admin only)
   */
  async getAllCertificates(req: Request, res: Response) {
    try {
      const certificates = await certificateService.getAllCertificates();

      res.json({
        message: 'Certificates fetched successfully',
        certificates,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Revoke a certificate (Admin only)
   */
  async revokeCertificate(req: Request, res: Response) {
    try {
      const certificateId = Array.isArray(req.params.certificateId) 
        ? req.params.certificateId[0] 
        : req.params.certificateId;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const certificate = await certificateService.revokeCertificate(certificateId, adminId);

      res.json({
        message: 'Certificate revoked successfully',
        certificate,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificate(req: Request, res: Response) {
    try {
      const certificateId = Array.isArray(req.params.certificateId) 
        ? req.params.certificateId[0] 
        : req.params.certificateId;

      const pdfDataUrl = await certificateService.getCertificatePDF(certificateId);

      if (!pdfDataUrl) {
        return res.status(404).json({ message: 'Certificate not found or PDF not available' });
      }

      res.json({
        message: 'Certificate PDF fetched successfully',
        pdfUrl: pdfDataUrl,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const certificateController = new CertificateController();
