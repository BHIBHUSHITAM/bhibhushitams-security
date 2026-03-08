'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Shield, Calendar, User, Award, Download } from 'lucide-react';
import { verifyCertificate, downloadCertificatePDF, CertificateVerification } from '@/lib/certificates/api';
import { GlassCard } from '@/components/landing/glass-card';

export function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (certificateId && typeof certificateId === 'string') {
      loadCertificate(certificateId);
    }
  }, [certificateId]);

  const loadCertificate = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await verifyCertificate(id);
      setCertificate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificateId || typeof certificateId !== 'string') return;
    
    try {
      setDownloading(true);
      const pdfDataUrl = await downloadCertificatePDF(certificateId);
      const [header, base64] = pdfDataUrl.split(',');
      const mimeMatch = header.match(/data:(.*?);base64/);
      const mime = mimeMatch?.[1] || 'application/pdf';
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      alert('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-cyan-400 text-xl"
        >
          Verifying certificate...
        </motion.div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <GlassCard className="text-center p-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
            <p className="text-gray-400">
              {error || 'The certificate you are looking for does not exist or has been removed.'}
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const isRevoked = certificate.status === 'revoked';

  return (
    <div className="min-h-screen bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              {isRevoked ? (
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
              ) : (
                <CheckCircle className="w-20 h-20 text-cyan-400 mx-auto" />
              )}
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isRevoked ? 'Certificate Revoked' : 'Certificate Verified'}
            </h1>
            <p className="text-gray-400">
              {isRevoked
                ? 'This certificate has been revoked and is no longer valid'
                : 'This certificate is authentic and issued by Bhibhushitams Security'}
            </p>
          </div>

          {/* Certificate Details */}
          <GlassCard className="p-8 mb-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left side - Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 mb-4">Certificate Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-400">Certificate ID</div>
                        <div className="text-white font-mono">{certificate.certificateId}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-400">Student Name</div>
                        <div className="text-white">{certificate.studentName}</div>
                        <div className="text-sm text-gray-500">{certificate.studentEmail}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-400">Achievement</div>
                        <div className="text-white font-semibold">{certificate.title}</div>
                        {certificate.courseName && (
                          <div className="text-sm text-cyan-400">Course: {certificate.courseName}</div>
                        )}
                        {certificate.internshipName && (
                          <div className="text-sm text-cyan-400">Internship: {certificate.internshipName}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-400">Issue Date</div>
                        <div className="text-white">
                          {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    {certificate.metadata && (
                      <>
                        {certificate.metadata.grade && (
                          <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-400">Grade</div>
                              <div className="text-white">{certificate.metadata.grade}</div>
                            </div>
                          </div>
                        )}
                        {certificate.metadata.score !== undefined && (
                          <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-400">Score</div>
                              <div className="text-white">{certificate.metadata.score}%</div>
                            </div>
                          </div>
                        )}
                        {certificate.metadata.duration && (
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-400">Duration</div>
                              <div className="text-white">{certificate.metadata.duration}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {!isRevoked && (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" />
                    {downloading ? 'Downloading...' : 'Download Certificate PDF'}
                  </button>
                )}
              </div>

              {/* Right side - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img
                    src={certificate.qrCodeUrl}
                    alt="Certificate QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Scan this QR code to verify the certificate
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Skills */}
          {certificate.metadata?.skills && certificate.metadata.skills.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Skills Acquired</h3>
              <div className="flex flex-wrap gap-2">
                {certificate.metadata.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
