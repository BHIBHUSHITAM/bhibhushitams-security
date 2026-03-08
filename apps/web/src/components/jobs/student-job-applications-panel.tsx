'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { getStudentApplications, JobApplication } from '@/lib/jobs/api';
import { GlassCard } from '@/components/landing/glass-card';

export function StudentJobApplicationsPanel() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getStudentApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'shortlisted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'reviewed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyan-400">Loading applications...</div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
        <p className="text-gray-400 mb-4">Start applying for jobs to see your applications here</p>
        <Link
          href="/jobs"
          className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          Browse Jobs
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Job Applications</h2>
          <p className="text-gray-400">Track your job application status</p>
        </div>
        <Link
          href="/jobs"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          Browse More Jobs
        </Link>
      </div>

      {/* Application Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {['pending', 'reviewed', 'shortlisted', 'accepted'].map((status) => {
          const count = applications.filter((app) => app.status === status).length;
          return (
            <GlassCard key={status} className="p-4">
              <div className="text-2xl font-bold text-cyan-400 mb-1">{count}</div>
              <div className="text-sm text-gray-400 capitalize">{status}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app, index) => (
          <motion.div
            key={app._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{app.jobId.title}</h3>
                      <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <Building2 className="w-4 h-4" />
                        <span>{app.companyId.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.jobId.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {app.coverLetter && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-400 mb-1">Cover Letter:</div>
                      <p className="text-sm text-gray-300 line-clamp-2">{app.coverLetter}</p>
                    </div>
                  )}

                  {/* Resume Link */}
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View Resume
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status.toUpperCase()}
                  </span>

                  {/* Status History */}
                  {app.statusHistory.length > 1 && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Status Updates:</div>
                      <div className="space-y-1">
                        {app.statusHistory.slice(-3).reverse().map((history, i) => (
                          <div key={i} className="text-xs text-gray-400">
                            {history.status} - {new Date(history.changedAt).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Job Link */}
                  <Link
                    href={`/jobs/${app.jobId._id}`}
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    View Job Details
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Company Notes (if any) */}
              {app.companyNotes && (
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                  <div className="text-sm text-gray-400 mb-1">Company Notes:</div>
                  <p className="text-sm text-gray-300">{app.companyNotes}</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
