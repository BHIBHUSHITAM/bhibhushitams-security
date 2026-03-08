'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  Filter,
  X
} from 'lucide-react';
import { getJobs, Job, JobFilters, JobType, ExperienceLevel } from '@/lib/jobs/api';
import { GlassCard } from '@/components/landing/glass-card';

export function JobListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    jobType: undefined,
    experienceLevel: undefined,
    minSalary: undefined,
    isRemote: undefined,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (appliedFilters?: JobFilters) => {
    try {
      setLoading(true);
      const data = await getJobs(appliedFilters);
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadJobs(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters: JobFilters = {
      search: '',
      location: '',
      jobType: undefined,
      experienceLevel: undefined,
      minSalary: undefined,
      isRemote: undefined,
    };
    setFilters(emptyFilters);
    loadJobs(emptyFilters);
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  return (
    <div className="min-h-screen bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Cybersecurity Jobs</h1>
          <p className="text-gray-400">Find your next opportunity in cybersecurity</p>
        </motion.div>

        {/* Search Bar */}
        <GlassCard className="p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search jobs, skills..."
                  className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-cyan-500/20 grid md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="e.g., Mumbai, Bangalore"
                  className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Job Type</label>
                <select
                  value={filters.jobType || ''}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value as JobType || undefined })}
                  className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Experience Level</label>
                <select
                  value={filters.experienceLevel || ''}
                  onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value as ExperienceLevel || undefined })}
                  className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Levels</option>
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Min Salary (₹)</label>
                <input
                  type="number"
                  value={filters.minSalary || ''}
                  onChange={(e) => setFilters({ ...filters, minSalary: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 300000"
                  className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Work Mode</label>
                <select
                  value={filters.isRemote === undefined ? '' : filters.isRemote.toString()}
                  onChange={(e) => setFilters({ ...filters, isRemote: e.target.value === '' ? undefined : e.target.value === 'true' })}
                  className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Modes</option>
                  <option value="true">Remote</option>
                  <option value="false">On-site</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </GlassCard>

        {/* Job Count */}
        <div className="mb-4 text-gray-400">
          {loading ? 'Loading...' : `${jobs.length} jobs found`}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-cyan-400">Loading jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
            <p className="text-gray-400">Try adjusting your filters or search criteria</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/jobs/${job._id}`}>
                  <GlassCard className="p-6 hover:border-cyan-500/50 transition-all cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                            <p className="text-cyan-400">{job.companyId.name}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location} {job.isRemote && '(Remote)'}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.experienceYears.min}-{job.experienceYears.max} years
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs">
                            {job.jobType}
                          </span>
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs">
                            {job.experienceLevel}
                          </span>
                          {job.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-xs">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-500/20 border border-gray-500/30 rounded text-gray-400 text-xs">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-cyan-400">
                          {job.totalApplications} applicants
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
