'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Briefcase,
  CheckCircle,
  Award,
  Calendar,
  Target,
  AlertCircle,
  Users,
  FileCheck,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { GlassCard } from '@/components/landing/glass-card';
import { getStudentDashboard } from '@/lib/dashboard/api';
import { getCurrentUser } from '@/lib/auth/api';
import { getStudentEnrollments } from '@/lib/courses/api';
import { downloadCertificatePDF, getStudentCertificates } from '@/lib/certificates/api';
import { logout } from '@/lib/auth/api';
import { clearSession } from '@/lib/auth/session';
import type { AuthUser } from '@/lib/auth/types';
import type { CourseEnrollment } from '@/lib/courses/types';
import type { Certificate } from '@/lib/certificates/api';

interface DashboardStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  internshipsApplied: number;
  internshipsActive: number;
  jobsApplied: number;
  jobsSaved: number;
  eventsAttended: number;
  certificatesVerified: number;
  ambassadorStatus: string;
  ambassadorTier?: string;
  totalScore: number;
  scoreBreakdown?: {
    courseCompletionCredits: number;
    internshipSelectionCredits: number;
    jobAcceptanceCredits: number;
    eventAttendanceCredits: number;
    certificateCredits: number;
    ambassadorCredits: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'course' | 'internship' | 'job' | 'event' | 'certificate' | 'ambassador';
  title: string;
  description: string;
  date: Date;
  icon: LucideIcon;
}

export const StudentDashboardComponent = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [latestCertificate, setLatestCertificate] = useState<Certificate | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [downloadingCertificateId, setDownloadingCertificateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [{ stats: apiStats }, { user }, { enrollments }, certificatesResponse] = await Promise.all([
        getStudentDashboard(),
        getCurrentUser(),
        getStudentEnrollments(),
        getStudentCertificates(),
      ]);

      setCurrentUser(user);

      // Map API response to component structure
      const realStats: DashboardStats = {
        coursesEnrolled: apiStats.coursesEnrolled || 0,
        coursesCompleted: apiStats.coursesCompleted || 0,
        internshipsApplied: apiStats.internshipsApplied || 0,
        internshipsActive: apiStats.internshipsActive || 0,
        jobsApplied: apiStats.jobsApplied || 0,
        jobsSaved: apiStats.jobsSaved || 0,
        eventsAttended: apiStats.eventsAttended || 0,
        certificatesVerified: apiStats.certificatesEarned || 0,
        ambassadorStatus: apiStats.ambassadorStatus || 'none',
        ambassadorTier: apiStats.ambassadorTier,
        totalScore: apiStats.totalScore || 0,
        scoreBreakdown: apiStats.scoreBreakdown,
      };

      const certificateActivities: RecentActivity[] = certificatesResponse
        .slice(0, 3)
        .map((certificate: Certificate) => ({
          id: `cert-${certificate._id}`,
          type: 'certificate',
          title: certificate.title,
          description: `Certificate issued (${certificate.status})`,
          date: new Date(certificate.issueDate),
          icon: FileCheck,
        }));

      const activeLatestCertificate = certificatesResponse.find(
        (certificate: Certificate) => certificate.status === 'active'
      );

      const enrollmentActivities: RecentActivity[] = enrollments
        .slice(0, 5)
        .map((enrollment: CourseEnrollment) => {
          const courseTitle =
            typeof enrollment.courseId === 'string'
              ? 'Course Enrollment'
              : enrollment.courseId.title;
          const isCompleted = enrollment.progressPercent >= 100;

          return {
            id: `enroll-${enrollment._id}`,
            type: 'course',
            title: courseTitle,
            description: isCompleted
              ? 'Course completed'
              : `Progress: ${enrollment.progressPercent}%`,
            date: new Date(enrollment.completedAt || enrollment.createdAt),
            icon: isCompleted ? CheckCircle : BookOpen,
          };
        });

      const ambassadorActivity: RecentActivity[] =
        realStats.ambassadorStatus && realStats.ambassadorStatus !== 'none'
          ? [
              {
                id: 'ambassador-status',
                type: 'ambassador',
                title: 'Ambassador Program',
                description: `Status: ${realStats.ambassadorStatus}`,
                date: new Date(),
                icon: Users,
              },
            ]
          : [];

      const realActivities = [...certificateActivities, ...enrollmentActivities, ...ambassadorActivity]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 6);

      setStats(realStats);
      setActivities(realActivities);
      setLatestCertificate(activeLatestCertificate ?? null);
      setEnrollments(enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateDownload = async (certificateId: string) => {
    try {
      setDownloadingCertificateId(certificateId);
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

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingCertificateId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Continue local cleanup even if API call fails.
    } finally {
      clearSession();
      router.push('/login');
      router.refresh();
    }
  };

  const getProgressPercent = (current: number, target: number) => {
    return target === 0 ? 100 : Math.min((current / target) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!
          </h1>
          <p className="text-gray-400">
            {currentUser?.email
              ? `Signed in as ${currentUser.email}`
              : 'Track your progress across all cybersecurity learning paths'}
          </p>
        </motion.div>

        {stats && (
          <>
            {/* Overall Score & Ambassador Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {/* Total Score */}
              <GlassCard className="p-6 gradient-border-cyan">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Score</p>
                    <h2 className="text-4xl font-bold text-cyan-400 mt-1">{stats.totalScore}</h2>
                  </div>
                  <div className="bg-cyan-500/20 p-3 rounded-full">
                    <TrendingUp className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Keep learning to increase your score!
                </div>
              </GlassCard>

              {/* Ambassador Status */}
              {stats.ambassadorStatus && (
                <GlassCard className="p-6 gradient-border-purple">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Ambassador Tier</p>
                      <h2 className="text-3xl font-bold text-purple-400 mt-1 capitalize">
                        {stats.ambassadorTier}
                      </h2>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded-full">
                      <Award className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: <span className="text-purple-400 font-semibold capitalize">{stats.ambassadorStatus}</span>
                  </div>
                </GlassCard>
              )}

              {/* Certificates */}
              <GlassCard className="p-6 gradient-border-green">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Verified Certificates</p>
                    <h2 className="text-4xl font-bold text-green-400 mt-1">{stats.certificatesVerified}</h2>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <FileCheck className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Shareable credentials on your profile
                </div>
              </GlassCard>
            </motion.div>

            {/* Progress Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {/* Courses */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-300 font-semibold">Courses</h3>
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold mb-2">{stats.coursesEnrolled}</div>
                <p className="text-xs text-gray-500 mb-3">Enrolled (Completed: {stats.coursesCompleted})</p>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    animate={{
                      width: `${getProgressPercent(stats.coursesCompleted, stats.coursesEnrolled)}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
                </div>
              </GlassCard>

              {/* Internships */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-300 font-semibold">Internships</h3>
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold mb-2">{stats.internshipsApplied}</div>
                <p className="text-xs text-gray-500 mb-3">Applied (Active: {stats.internshipsActive})</p>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    animate={{
                      width: `${getProgressPercent(stats.internshipsActive, stats.internshipsApplied)}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  />
                </div>
              </GlassCard>

              {/* Jobs */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-300 font-semibold">Jobs</h3>
                  <Target className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold mb-2">{stats.jobsApplied}</div>
                <p className="text-xs text-gray-500 mb-3">Applied (Saved: {stats.jobsSaved})</p>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    animate={{
                      width: `${getProgressPercent(stats.jobsApplied, 20)}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  />
                </div>
              </GlassCard>

              {/* Events */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-300 font-semibold">Events</h3>
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold mb-2">{stats.eventsAttended}</div>
                <p className="text-xs text-gray-500 mb-3">Attended events this year</p>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    animate={{ width: `${Math.min((stats.eventsAttended / 12) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Certificate Quick Download */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-8"
            >
              <GlassCard className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Certificate Download</h2>
                    {latestCertificate ? (
                      <p className="text-sm text-gray-400 mt-1">
                        Latest active certificate: <span className="text-cyan-300">{latestCertificate.title}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">
                        No active certificate available yet.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/student/certificates"
                      className="rounded-lg border border-cyan-400/40 bg-white/5 px-4 py-2 text-sm text-cyan-100 hover:bg-white/10"
                    >
                      Open Certificates
                    </Link>

                    {latestCertificate && (
                      <button
                        type="button"
                        onClick={() => handleCertificateDownload(latestCertificate.certificateId)}
                        disabled={downloadingCertificateId === latestCertificate.certificateId}
                        className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-60"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          {downloadingCertificateId === latestCertificate.certificateId
                            ? 'Downloading...'
                            : 'Download Latest'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Enrolled Courses On Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="mb-8"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-white">Enrolled Courses</h2>
                  <Link
                    href="/student/courses"
                    className="rounded-lg border border-cyan-400/40 bg-white/5 px-4 py-2 text-xs text-cyan-100 hover:bg-white/10"
                  >
                    View All
                  </Link>
                </div>

                {enrollments.length === 0 ? (
                  <p className="text-sm text-gray-400">No enrolled courses found.</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.slice(0, 4).map((enrollment) => {
                      const course =
                        typeof enrollment.courseId === 'string' ? null : enrollment.courseId;

                      return (
                        <div
                          key={enrollment._id}
                          className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {course?.title ?? 'Course Enrollment'}
                              </p>
                              <p className="text-xs text-gray-400">
                                Progress: {enrollment.progressPercent}%
                              </p>
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                enrollment.progressPercent >= 100
                                  ? 'text-green-400'
                                  : 'text-cyan-300'
                              }`}
                            >
                              {enrollment.progressPercent >= 100 ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Credit Breakdown */}
            {stats.scoreBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="mb-8"
              >
                <GlassCard className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Credit Breakdown</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="text-gray-300">Course completions</div>
                    <div className="text-right text-cyan-300">
                      {stats.scoreBreakdown.courseCompletionCredits}
                    </div>

                    <div className="text-gray-300">Internship selections</div>
                    <div className="text-right text-cyan-300">
                      {stats.scoreBreakdown.internshipSelectionCredits}
                    </div>

                    <div className="text-gray-300">Job acceptances</div>
                    <div className="text-right text-cyan-300">
                      {stats.scoreBreakdown.jobAcceptanceCredits}
                    </div>

                    <div className="text-gray-300">Event attendance</div>
                    <div className="text-right text-cyan-300">
                      {stats.scoreBreakdown.eventAttendanceCredits}
                    </div>

                    <div className="text-gray-300">Certificates earned</div>
                    <div className="text-right text-cyan-300">
                      {stats.scoreBreakdown.certificateCredits}
                    </div>

                    <div className="text-gray-300">Ambassador credits</div>
                    <div className="text-right text-cyan-300">
                      {stats.scoreBreakdown.ambassadorCredits}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Learning Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                  Learning Path Breakdown
                </h2>

                <div className="space-y-6">
                  {/* Courses Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Cybersecurity Courses</span>
                      <span className="text-sm text-cyan-400 font-semibold">
                        {stats.coursesCompleted} / {stats.coursesEnrolled}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        animate={{
                          width: `${getProgressPercent(stats.coursesCompleted, stats.coursesEnrolled)}%`,
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
                  </div>

                  {/* Internship Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Internship Programs</span>
                      <span className="text-sm text-blue-400 font-semibold">
                        {stats.internshipsActive} / {stats.internshipsApplied}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        animate={{
                          width: `${getProgressPercent(stats.internshipsActive, stats.internshipsApplied)}%`,
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Job Search */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Job Search Activity</span>
                      <span className="text-sm text-orange-400 font-semibold">
                        {stats.jobsApplied} Applications
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        animate={{ width: `${getProgressPercent(stats.jobsApplied, 20)}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

                <div className="space-y-4">
                  {activities.length === 0 && (
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm text-gray-400">
                      No recent activity yet. Start by enrolling in a course to see updates here.
                    </div>
                  )}

                  {activities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="flex gap-4 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-500/20">
                            <IconComponent className="h-6 w-6 text-cyan-400" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(activity.date)}</p>
                        </div>

                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Link href="/student/courses">
                <GlassCard className="p-6 text-center hover:border-cyan-500/50 transition-all cursor-pointer h-full">
                  <BookOpen className="w-8 h-8 mx-auto text-cyan-400 mb-3" />
                  <h3 className="font-semibold mb-1">Explore Courses</h3>
                  <p className="text-xs text-gray-400">Continue your learning</p>
                </GlassCard>
              </Link>

              <Link href="/student/internships">
                <GlassCard className="p-6 text-center hover:border-green-500/50 transition-all cursor-pointer h-full">
                  <Briefcase className="w-8 h-8 mx-auto text-green-400 mb-3" />
                  <h3 className="font-semibold mb-1">Find Internships</h3>
                  <p className="text-xs text-gray-400">Gain practical experience</p>
                </GlassCard>
              </Link>

              <Link href="/student/job-applications">
                <GlassCard className="p-6 text-center hover:border-orange-500/50 transition-all cursor-pointer h-full">
                  <Target className="w-8 h-8 mx-auto text-orange-400 mb-3" />
                  <h3 className="font-semibold mb-1">Job Opportunities</h3>
                  <p className="text-xs text-gray-400">Search for positions</p>
                </GlassCard>
              </Link>

              <Link href="/student/ambassador">
                <GlassCard className="p-6 text-center hover:border-purple-500/50 transition-all cursor-pointer h-full">
                  <Award className="w-8 h-8 mx-auto text-purple-400 mb-3" />
                  <h3 className="font-semibold mb-1">Ambassador Program</h3>
                  <p className="text-xs text-gray-400">Lead on campus</p>
                </GlassCard>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
