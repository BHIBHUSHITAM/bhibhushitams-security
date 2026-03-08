const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const API_URL = `${API_BASE_URL}/certificates`;
import { authFetch, parseApiJson } from '@/lib/auth/http';

export interface Certificate {
  _id: string;
  certificateId: string;
  studentId: string;
  type: 'course' | 'internship' | 'event';
  courseId?: {
    _id: string;
    title: string;
  };
  internshipId?: {
    _id: string;
    title: string;
  };
  title: string;
  description?: string;
  issueDate: string;
  status: 'active' | 'revoked';
  qrCodeUrl: string;
  verificationUrl: string;
  pdfUrl?: string;
  issuedBy: string;
  metadata?: {
    completionDate?: string;
    grade?: string;
    score?: number;
    duration?: string;
    skills?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CertificateVerification {
  certificateId: string;
  status: 'active' | 'revoked';
  studentName: string;
  studentEmail: string;
  type: 'course' | 'internship' | 'event';
  title: string;
  courseName?: string;
  internshipName?: string;
  issueDate: string;
  issuedBy: string;
  qrCodeUrl: string;
  metadata?: {
    completionDate?: string;
    grade?: string;
    score?: number;
    duration?: string;
    skills?: string[];
  };
}

export interface CreateCertificateInput {
  studentId: string;
  type: 'course' | 'internship' | 'event';
  courseId?: string;
  internshipId?: string;
  eventId?: string;
  title: string;
  description?: string;
  metadata?: {
    completionDate?: string;
    grade?: string;
    score?: number;
    duration?: string;
    skills?: string[];
  };
}

export async function verifyCertificate(certificateId: string): Promise<CertificateVerification> {
  const response = await fetch(`${API_URL}/verify/${certificateId}`);
  if (!response.ok) {
    throw new Error('Certificate not found');
  }
  const data = await response.json();
  return data.certificate;
}

export async function getStudentCertificates(): Promise<Certificate[]> {
  const response = await authFetch(`${API_URL}/my-certificates`);
  const data = await parseApiJson<{ certificates: Certificate[] }>(response);
  return data.certificates;
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const response = await authFetch(`${API_URL}/all`);
  const data = await parseApiJson<{ certificates: Certificate[] }>(response);
  return data.certificates;
}

export async function createCertificate(input: CreateCertificateInput): Promise<Certificate> {
  const response = await authFetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const data = await parseApiJson<{ certificate: Certificate }>(response);
  return data.certificate;
}

export async function revokeCertificate(certificateId: string): Promise<Certificate> {
  const response = await authFetch(`${API_URL}/revoke/${certificateId}`, {
    method: 'PATCH',
  });
  const data = await parseApiJson<{ certificate: Certificate }>(response);
  return data.certificate;
}

export async function downloadCertificatePDF(certificateId: string): Promise<string> {
  const response = await fetch(`${API_URL}/download/${certificateId}`);
  if (!response.ok) {
    throw new Error('Failed to download certificate');
  }
  const data = await response.json();
  return data.pdfUrl;
}
