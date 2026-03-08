'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  CheckCircle,
  Calendar,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { getJobById, applyForJob, Job } from '@/lib/jobs/api';
import { GlassCard } from '@/components/landing/glass-card';

export function JobDetailPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (jobId && typeof jobId === 'string') {
      loadJob(jobId);
    }
  }, [jobId]);

  const loadJob = async (id: string) => {
    try {
      setLoading(true);
      const data = await getJobById(id);
      setJob(data);
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!jobId || typeof jobId !== 'string') return;

    try {
      setApplying(true);
      setMessage({ type: '', text: '' });
      
      await applyForJob(jobId, {
        coverLetter: coverLetter || undefined,
        resumeUrl: resumeUrl || undefined,
      });

      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setShowApplyModal(false);
      
      // Reload job to update application count
      loadJob(jobId);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to apply',
      });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-cyan-400">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
          <p className="text-gray-400 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600"
          >
            Browse Jobs
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <GlassCard className="p-8 mb-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-cyan-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-cyan-400 mb-3">
                <Building2 className="w-5 h-5" />
                <span className="text-lg">{job.companyId.name}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location} {job.isRemote && '(Remote)'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {job.experienceYears.min}-{job.experienceYears.max} years experience
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.totalApplications} applicants
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Apply Now
            </button>
          </div>

          {/* Job Info Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-dark/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Salary Range</div>
              <div className="text-cyan-400 font-semibold">
                {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
              </div>
            </div>
            <div className="p-4 bg-dark/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Job Type</div>
              <div className="text-white font-semibold capitalize">{job.jobType}</div>
            </div>
            <div className="p-4 bg-dark/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Experience Level</div>
              <div className="text-white font-semibold capitalize">{job.experienceLevel}</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-3">Job Description</h2>
            <p className="text-gray-300 whitespace-pre-line">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Key Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Qualifications</h2>
              <ul className="space-y-2">
                {job.qualifications.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Openings & Deadline */}
          <div className="flex gap-4 pt-6 border-t border-cyan-500/20">
            <div>
              <span className="text-gray-400">Openings: </span>
              <span className="text-white font-semibold">{job.openings}</span>
            </div>
            {job.applicationDeadline && (
              <div>
                <span className="text-gray-400">Deadline: </span>
                <span className="text-white font-semibold">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full"
            >
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Apply for {job.title}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Resume URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a link to your resume (Google Drive, Dropbox, etc.)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      placeholder="Tell us why you're a great fit for this role..."
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    disabled={applying}
                    className="flex-1 px-6 py-3 bg-dark/50 border border-cyan-500/30 text-white rounded-lg font-semibold hover:bg-dark/70 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
