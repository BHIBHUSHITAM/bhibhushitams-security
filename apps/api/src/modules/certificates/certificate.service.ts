import { Types } from 'mongoose';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { CertificateModel, ICertificate, CertificateType } from './certificate.model';
import { UserModel } from '../users/user.model';
import { CourseModel } from '../courses/course.model';
import { InternshipModel } from '../internships/internship.model';

interface CreateCertificateInput {
  studentId: string;
  type: CertificateType;
  courseId?: string;
  internshipId?: string;
  eventId?: string;
  title: string;
  description?: string;
  issuedBy: string;
  metadata?: {
    completionDate?: Date;
    grade?: string;
    score?: number;
    duration?: string;
    skills?: string[];
  };
}

export class CertificateService {
  /**
   * Generate unique certificate ID
   * Format: CERT-YYYYMMDD-RANDOM8
   */
  private generateCertificateId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `CERT-${dateStr}-${random}`;
  }

  /**
   * Generate QR code as data URL
   */
  private async generateQRCode(verificationUrl: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate PDF certificate (returns base64)
   */
  private async generatePDF(certificate: ICertificate, studentName: string, itemName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 50,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          const base64 = pdfBuffer.toString('base64');
          resolve(`data:application/pdf;base64,${base64}`);
        });
        doc.on('error', reject);

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const outerX = 24;
        const outerY = 24;
        const outerW = pageW - 48;
        const outerH = pageH - 48;

        // Premium light background for better print quality.
        doc.rect(0, 0, pageW, pageH).fill('#f8fafc');

        // Decorative cyber grid accent.
        doc.save();
        doc.lineWidth(0.3).strokeColor('#cbd5e1').opacity(0.6);
        for (let x = 30; x < pageW - 30; x += 24) {
          doc.moveTo(x, 30).lineTo(x, pageH - 30).stroke();
        }
        for (let y = 30; y < pageH - 30; y += 24) {
          doc.moveTo(30, y).lineTo(pageW - 30, y).stroke();
        }
        doc.restore();

        // Main border.
        doc.roundedRect(outerX, outerY, outerW, outerH, 14)
          .lineWidth(2)
          .strokeColor('#0f172a')
          .stroke();

        doc.roundedRect(outerX + 10, outerY + 10, outerW - 20, outerH - 20, 12)
          .lineWidth(1)
          .strokeColor('#334155')
          .stroke();

        // Top header bar.
        doc.roundedRect(outerX + 18, outerY + 18, outerW - 36, 56, 10)
          .fillAndStroke('#0f172a', '#0f172a');

        // Custom Bhibhushitams Security logo mark (vector-drawn).
        const logoX = outerX + 36;
        const logoY = outerY + 32;
        doc.save();
        doc.moveTo(logoX + 12, logoY)
          .lineTo(logoX + 24, logoY + 8)
          .lineTo(logoX + 24, logoY + 24)
          .lineTo(logoX + 12, logoY + 34)
          .lineTo(logoX, logoY + 24)
          .lineTo(logoX, logoY + 8)
          .closePath()
          .fill('#22d3ee');
        doc.moveTo(logoX + 12, logoY + 8)
          .lineTo(logoX + 17, logoY + 14)
          .lineTo(logoX + 13, logoY + 20)
          .lineTo(logoX + 20, logoY + 20)
          .lineTo(logoX + 8, logoY + 30)
          .lineTo(logoX + 11, logoY + 22)
          .lineTo(logoX + 5, logoY + 22)
          .closePath()
          .fill('#0f172a');
        doc.restore();

        doc.font('Helvetica-Bold').fontSize(15).fillColor('#f8fafc')
          .text('Bhibhushitams Security', logoX + 34, outerY + 34, { lineBreak: false });
        doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1')
          .text('Cyber Workforce Development and Credentialing', logoX + 34, outerY + 52, {
            lineBreak: false,
          });

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#22d3ee')
          .text('CERTIFIED', outerX + outerW - 126, outerY + 40, { width: 90, align: 'right' });

        // Certificate heading.
        doc.font('Helvetica').fontSize(12).fillColor('#334155')
          .text('CERTIFICATE OF ACHIEVEMENT', 0, 108, { align: 'center' });
        doc.font('Helvetica-Bold').fontSize(35).fillColor('#0f172a')
          .text('Completion Certificate', 0, 128, { align: 'center' });

        doc.font('Helvetica').fontSize(13).fillColor('#475569')
          .text('This certifies that', 0, 188, { align: 'center' });

        doc.font('Helvetica-Bold').fontSize(34).fillColor('#0f172a')
          .text(studentName, 0, 210, { align: 'center' });

        doc.moveTo(180, 252).lineTo(pageW - 180, 252).lineWidth(1).strokeColor('#94a3b8').stroke();

        doc.font('Helvetica').fontSize(12).fillColor('#334155')
          .text('has successfully completed the cybersecurity program', 0, 270, { align: 'center' });

        doc.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a')
          .text(itemName, 120, 294, { align: 'center', width: pageW - 240 });

        const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const completionDate = certificate.metadata?.completionDate
          ? new Date(certificate.metadata.completionDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : issueDate;

        // Trust panel.
        const trustY = 354;
        doc.roundedRect(126, trustY, pageW - 252, 82, 10)
          .fillAndStroke('#e2e8f0', '#cbd5e1');

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a')
          .text(`Certificate ID: ${certificate.certificateId}`, 142, trustY + 14, {
            width: pageW - 284,
          });
        doc.font('Helvetica').fontSize(9).fillColor('#334155')
          .text(`Issued: ${issueDate}`, 142, trustY + 31, { width: 180 })
          .text(`Completed: ${completionDate}`, 142, trustY + 45, { width: 180 })
          .text('Issuer: Bhibhushitams Security Certification Authority', 340, trustY + 31, {
            width: 300,
          })
          .text(`Verify: ${certificate.verificationUrl}`, 340, trustY + 45, {
            width: 300,
          });

        if (certificate.metadata?.grade || typeof certificate.metadata?.score === 'number') {
          const gradeValue = certificate.metadata?.grade ?? 'Pass';
          const scoreValue =
            typeof certificate.metadata?.score === 'number'
              ? `${certificate.metadata.score}%`
              : 'N/A';
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a')
            .text(`Grade: ${gradeValue}    Score: ${scoreValue}`, 142, trustY + 61, {
              width: pageW - 284,
            });
        }

        // Signature and seal block.
        const sigY = 470;
        doc.moveTo(120, sigY).lineTo(300, sigY).lineWidth(1).strokeColor('#64748b').stroke();
        doc.moveTo(pageW - 300, sigY).lineTo(pageW - 120, sigY).lineWidth(1).strokeColor('#64748b').stroke();

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a')
          .text('Authorized Signature', 120, sigY + 6, { width: 180, align: 'center' })
          .text('Digital Credential Seal', pageW - 300, sigY + 6, { width: 180, align: 'center' });

        doc.circle(pageW - 210, sigY + 56, 28).lineWidth(2).strokeColor('#0f172a').stroke();
        doc.circle(pageW - 210, sigY + 56, 20).lineWidth(1).strokeColor('#334155').stroke();
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#0f172a')
          .text('BSS', pageW - 222, sigY + 51, { width: 24, align: 'center' });

        // Footer strip.
        doc.rect(outerX + 18, pageH - 66, outerW - 36, 30).fill('#0f172a');
        doc.font('Helvetica').fontSize(8).fillColor('#cbd5e1')
          .text('www.bhibhushitams.com  |  certificates@bhibhushitams.com  |  Credential Hash Protected', 0, pageH - 56, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create a new certificate
   */
  async createCertificate(input: CreateCertificateInput): Promise<ICertificate> {
    // Validate student exists
    const student = await UserModel.findById(input.studentId);
    if (!student || student.role !== 'student') {
      throw new Error('Student not found');
    }

    // Validate issuer is admin
    const issuer = await UserModel.findById(input.issuedBy);
    if (!issuer || issuer.role !== 'admin') {
      throw new Error('Only admins can issue certificates');
    }

    // Validate the reference based on type
    let itemName = '';
    if (input.type === 'course' && input.courseId) {
      const course = await CourseModel.findById(input.courseId);
      if (!course) throw new Error('Course not found');
      itemName = course.title;
    } else if (input.type === 'internship' && input.internshipId) {
      const internship = await InternshipModel.findById(input.internshipId);
      if (!internship) throw new Error('Internship not found');
      itemName = internship.title;
    } else if (input.type === 'event') {
      itemName = input.title; // For events, use the title directly
    }

    // Generate unique certificate ID
    const certificateId = this.generateCertificateId();

    // Generate verification URL (this should be your frontend domain)
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}`;

    // Generate QR code
    const qrCodeUrl = await this.generateQRCode(verificationUrl);

    // Create certificate document
    const certificate = await CertificateModel.create({
      certificateId,
      studentId: new Types.ObjectId(input.studentId),
      type: input.type,
      courseId: input.courseId ? new Types.ObjectId(input.courseId) : undefined,
      internshipId: input.internshipId ? new Types.ObjectId(input.internshipId) : undefined,
      eventId: input.eventId ? new Types.ObjectId(input.eventId) : undefined,
      title: input.title,
      description: input.description,
      issueDate: new Date(),
      status: 'active',
      qrCodeUrl,
      verificationUrl,
      issuedBy: new Types.ObjectId(input.issuedBy),
      metadata: input.metadata,
    });

    // Generate PDF
    const pdfDataUrl = await this.generatePDF(certificate, student.name, itemName || input.title);
    certificate.pdfUrl = pdfDataUrl;
    await certificate.save();

    return certificate;
  }

  /**
   * Verify a certificate by its ID
   */
  async verifyCertificate(certificateId: string) {
    const certificate = await CertificateModel.findOne({ certificateId })
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .populate('internshipId', 'title')
      .populate('issuedBy', 'name');

    if (!certificate) {
      return null;
    }

    return {
      certificateId: certificate.certificateId,
      status: certificate.status,
      studentName: (certificate.studentId as any)?.name,
      studentEmail: (certificate.studentId as any)?.email,
      type: certificate.type,
      title: certificate.title,
      courseName: (certificate.courseId as any)?.title,
      internshipName: (certificate.internshipId as any)?.title,
      issueDate: certificate.issueDate,
      issuedBy: (certificate.issuedBy as any)?.name,
      qrCodeUrl: certificate.qrCodeUrl,
      metadata: certificate.metadata,
    };
  }

  /**
   * Get all certificates for a student
   */
  async getStudentCertificates(studentId: string): Promise<ICertificate[]> {
    const certificates = await CertificateModel.find({ studentId })
      .populate('courseId', 'title')
      .populate('internshipId', 'title')
      .sort({ issueDate: -1 });

    return certificates;
  }

  /**
   * Get all certificates (admin only)
   */
  async getAllCertificates(): Promise<ICertificate[]> {
    const certificates = await CertificateModel.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .populate('internshipId', 'title')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });

    return certificates;
  }

  /**
   * Revoke a certificate
   */
  async revokeCertificate(certificateId: string, adminId: string): Promise<ICertificate> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Only admins can revoke certificates');
    }

    const certificate = await CertificateModel.findOneAndUpdate(
      { certificateId },
      { status: 'revoked' },
      { new: true }
    );

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return certificate;
  }

  /**
   * Download certificate PDF
   */
  async getCertificatePDF(certificateId: string): Promise<string | null> {
    const certificate = await CertificateModel.findOne({ certificateId });
    if (!certificate || !certificate.pdfUrl) {
      return null;
    }
    return certificate.pdfUrl;
  }
}

export const certificateService = new CertificateService();
