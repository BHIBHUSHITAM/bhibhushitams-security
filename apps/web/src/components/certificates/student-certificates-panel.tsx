'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, Calendar, Shield } from 'lucide-react';
import { getStudentCertificates, downloadCertificatePDF, Certificate } from '@/lib/certificates/api';
import { GlassCard } from '@/components/landing/glass-card';

export function StudentCertificatesPanel() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getStudentCertificates();
      setCertificates(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load certificates';
      setError(message);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, base64] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch?.[1] || 'application/pdf';
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  };

  const handleDownload = async (certificateId: string) => {
    try {
      setDownloading(certificateId);
      const pdfDataUrl = await downloadCertificatePDF(certificateId);
      const pdfBlob = dataUrlToBlob(pdfDataUrl);
      const objectUrl = URL.createObjectURL(pdfBlob);

      // Create a link and trigger download without opening a new page.
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
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyan-400">Loading certificates...</div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <>
        {error && (
          <GlassCard className="p-6 mb-4 border border-red-500/30">
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <button
              onClick={loadCertificates}
              className="rounded-md border border-red-400/40 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10"
            >
              Retry
            </button>
          </GlassCard>
        )}
        <GlassCard className="p-8 text-center">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
          <p className="text-gray-400">
            Complete courses, internships, or attend events to earn certificates!
          </p>
        </GlassCard>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">My Certificates</h2>
        <p className="text-gray-400">View and download your earned certificates</p>
      </div>

      {error && (
        <GlassCard className="p-4 border border-red-500/30">
          <p className="text-red-300 text-sm">{error}</p>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-cyan-400" />
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      cert.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {cert.status.toUpperCase()}
                  </span>
                </div>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                  {cert.type.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>

              {/* Course/Internship Name */}
              {cert.courseId && (
                <p className="text-cyan-400 text-sm mb-2">
                  Course: {cert.courseId.title}
                </p>
              )}
              {cert.internshipId && (
                <p className="text-cyan-400 text-sm mb-2">
                  Internship: {cert.internshipId.title}
                </p>
              )}

              {/* Description */}
              {cert.description && (
                <p className="text-gray-400 text-sm mb-4">{cert.description}</p>
              )}

              {/* Metadata */}
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">
                    Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 font-mono text-xs">
                    {cert.certificateId}
                  </span>
                </div>

                {cert.metadata?.grade && (
                  <div className="text-sm">
                    <span className="text-gray-400">Grade: </span>
                    <span className="text-white font-semibold">{cert.metadata.grade}</span>
                  </div>
                )}

                {cert.metadata?.score !== undefined && (
                  <div className="text-sm">
                    <span className="text-gray-400">Score: </span>
                    <span className="text-white font-semibold">{cert.metadata.score}%</span>
                  </div>
                )}

                {cert.metadata?.duration && (
                  <div className="text-sm">
                    <span className="text-gray-400">Duration: </span>
                    <span className="text-white">{cert.metadata.duration}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {cert.metadata?.skills && cert.metadata.skills.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {cert.metadata.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code Preview */}
              {cert.qrCodeUrl && (
                <div className="mb-4 flex justify-center">
                  <div className="bg-white p-2 rounded">
                    <img
                      src={cert.qrCodeUrl}
                      alt="Certificate QR Code"
                      className="w-24 h-24"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {cert.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(cert.certificateId)}
                    disabled={downloading === cert.certificateId}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {downloading === cert.certificateId ? 'Downloading...' : 'Download PDF'}
                  </button>
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Verify certificate ${cert.certificateId}`}
                    title="Open verification page"
                    className="bg-dark/50 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg hover:bg-dark/70 transition-all duration-300 flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
