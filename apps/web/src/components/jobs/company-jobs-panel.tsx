'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  Users,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  getCompanyJobs,
  createJob,
  updateJobStatus,
  deleteJob,
  getJobApplications,
  updateApplicationStatus,
  Job,
  JobApplication,
  CreateJobInput,
  JobStatus,
  ApplicationStatus,
} from '@/lib/jobs/api';
import { GlassCard } from '@/components/landing/glass-card';

export function CompanyJobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [formData, setFormData] = useState<CreateJobInput>({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: '',
    isRemote: false,
    jobType: 'full-time',
    experienceLevel: 'junior',
    experienceYears: { min: 0, max: 2 },
    salary: { min: 0, max: 0, currency: 'INR' },
    skills: [''],
    qualifications: [''],
    openings: 1,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await getCompanyJobs();
      setJobs(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load jobs' });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      const data = await getJobApplications(jobId);
      setApplications(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load applications' });
    }
  };

  const handleCreateJob = async () => {
    try {
      setMessage({ type: '', text: '' });
      
      // Filter out empty strings from arrays
      const cleanedData: CreateJobInput = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim()),
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        skills: formData.skills.filter(s => s.trim()),
        qualifications: formData.qualifications.filter(q => q.trim()),
      };

      await createJob(cleanedData);
      setMessage({ type: 'success', text: 'Job posted successfully!' });
      setShowCreateModal(false);
      resetForm();
      loadJobs();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create job',
      });
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    try {
      await updateJobStatus(jobId, status);
      setMessage({ type: 'success', text: 'Job status updated!' });
      loadJobs();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await deleteJob(jobId);
      setMessage({ type: 'success', text: 'Job deleted successfully!' });
      loadJobs();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete job' });
    }
  };

  const handleViewApplications = async (job: Job) => {
    setSelectedJob(job);
    await loadApplications(job._id);
    setShowApplicationsModal(true);
  };

  const handleApplicationStatusChange = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    try {
      await updateApplicationStatus(applicationId, status);
      setMessage({ type: 'success', text: 'Application status updated!' });
      if (selectedJob) {
        loadApplications(selectedJob._id);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update application' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      location: '',
      isRemote: false,
      jobType: 'full-time',
      experienceLevel: 'junior',
      experienceYears: { min: 0, max: 2 },
      salary: { min: 0, max: 0, currency: 'INR' },
      skills: [''],
      qualifications: [''],
      openings: 1,
    });
  };

  const addArrayItem = (field: keyof CreateJobInput) => {
    setFormData({ ...formData, [field]: [...(formData[field] as string[]), ''] });
  };

  const updateArrayItem = (field: keyof CreateJobInput, index: number, value: string) => {
    const array = [...(formData[field] as string[])];
    array[index] = value;
    setFormData({ ...formData, [field]: array });
  };

  const removeArrayItem = (field: keyof CreateJobInput, index: number) => {
    const array = (formData[field] as string[]).filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: array });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Job Management</h2>
          <p className="text-gray-400">Post and manage your job listings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Jobs Posted Yet</h3>
          <p className="text-gray-400 mb-4">Create your first job posting to start receiving applications</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            Post Your First Job
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <GlassCard key={job._id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        job.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : job.status === 'closed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location} {job.isRemote && '(Remote)'}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ₹{job.salary.min.toLocaleString()} - ₹{job.salary.max.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {job.totalApplications} applications
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleViewApplications(job)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Applications
                  </button>

                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job._id, e.target.value as JobStatus)}
                    className="px-4 py-2 bg-dark/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full my-8"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Post New Job</h2>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Job Details */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Type *</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value as any })}
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level *</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="fresher">Fresher</option>
                      <option value="junior">Junior</option>
                      <option value="mid-level">Mid Level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Openings *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.openings}
                      onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })}
                      className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Experience Years & Salary */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience (Years) *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.experienceYears.min}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experienceYears: { ...formData.experienceYears, min: parseInt(e.target.value) },
                          })
                        }
                        placeholder="Min"
                        className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.experienceYears.max}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experienceYears: { ...formData.experienceYears, max: parseInt(e.target.value) },
                          })
                        }
                        placeholder="Max"
                        className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range (₹) *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.salary.min}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salary: { ...formData.salary, min: parseInt(e.target.value) },
                          })
                        }
                        placeholder="Min"
                        className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.salary.max}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salary: { ...formData.salary, max: parseInt(e.target.value) },
                          })
                        }
                        placeholder="Max"
                        className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRemote}
                    onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-300">Remote Position</label>
                </div>

                {/* Dynamic Arrays */}
                {['skills', 'requirements', 'responsibilities', 'qualifications'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      {field} *
                    </label>
                    {(formData[field as keyof CreateJobInput] as string[]).map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateArrayItem(field as keyof CreateJobInput, index, e.target.value)}
                          className="flex-1 bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => removeArrayItem(field as keyof CreateJobInput, index)}
                          className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(field as keyof CreateJobInput)}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      + Add {field.slice(0, -1)}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-dark/50 border border-cyan-500/30 text-white rounded-lg font-semibold hover:bg-dark/70 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Post Job
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl w-full my-8"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Applications for {selectedJob.title}
                </h2>
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="bg-dark/50 border border-cyan-500/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{app.studentId.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{app.studentId.email}</p>
                          {app.coverLetter && (
                            <p className="text-sm text-gray-300 mb-2 line-clamp-2">{app.coverLetter}</p>
                          )}
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-400 hover:text-cyan-300"
                            >
                              View Resume →
                            </a>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold text-center ${
                              app.status === 'accepted'
                                ? 'bg-green-500/20 text-green-400'
                                : app.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : app.status === 'shortlisted'
                                ? 'bg-blue-500/20 text-blue-400'
                                : app.status === 'reviewed'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {app.status.toUpperCase()}
                          </span>
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleApplicationStatusChange(app._id, e.target.value as ApplicationStatus)
                            }
                            className="px-3 py-1 bg-dark/50 border border-cyan-500/30 rounded text-white text-xs focus:outline-none focus:border-cyan-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="accepted">Accepted</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}
