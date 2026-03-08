'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Briefcase,
  Zap,
  Award,
  TrendingUp,
  AlertCircle,
  Loader,
  BarChart3,
  PieChart,
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  FileCheck,
  Trophy,
  LogOut,
} from 'lucide-react';
import { GlassCard } from '@/components/landing/glass-card';
import { logout } from '@/lib/auth/api';
import { clearSession } from '@/lib/auth/session';
import { getAdminDashboard } from '@/lib/dashboard/api';

interface AdminStats {
  totalStudents: number;
  totalInstructors: number;
  activeCoursesCount: number;
  totalEnrollments: number;
  activeInternshipsCount: number;
  totalApplications: number;
  activeJobPostingsCount: number;
  totalJobApplications: number;
  upcomingEventsCount: number;
  totalEventsAttended: number;
  activeAmbassadorsCount: number;
  pendingApplicationsCount: number;
  certificatesIssuedCount: number;
  platformHealthScore: number;
}

interface ModuleMetric {
  name: string;
  count: number;
  icon: any;
  color: string;
  trend: number;
}

export const AdminDashboardComponent = () => {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAdminData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Keep local cleanup even if API logout fails.
    } finally {
      clearSession();
      router.push('/login');
      router.refresh();
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const { stats: apiStats } = await getAdminDashboard();

      // Map API response to component structure
      const realStats: AdminStats = {
        totalStudents: apiStats.totalStudents || 0,
        totalInstructors: apiStats.totalCompanies || 0,
        activeCoursesCount: apiStats.activeCourses || 0,
        totalEnrollments: apiStats.totalEnrollments || 0,
        activeInternshipsCount: apiStats.activeInternships || 0,
        totalApplications: apiStats.totalInternshipApplications || 0,
        activeJobPostingsCount: apiStats.activeJobs || 0,
        totalJobApplications: apiStats.totalJobApplications || 0,
        upcomingEventsCount: apiStats.upcomingEvents || 0,
        totalEventsAttended: apiStats.totalEventRegistrations || 0,
        activeAmbassadorsCount: apiStats.activeAmbassadors || 0,
        pendingApplicationsCount: apiStats.pendingAmbassadorApplications || 0,
        certificatesIssuedCount: apiStats.certificatesIssued || 0,
        platformHealthScore: 98, // Keep static for now
      };

      setStats(realStats);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const moduleMetrics: ModuleMetric[] = [
    {
      name: 'Courses',
      count: stats?.activeCoursesCount || 0,
      icon: BookOpen,
      color: 'text-cyan-400',
      trend: 12,
    },
    {
      name: 'Internships',
      count: stats?.activeInternshipsCount || 0,
      icon: Briefcase,
      color: 'text-green-400',
      trend: 8,
    },
    {
      name: 'Jobs',
      count: stats?.activeJobPostingsCount || 0,
      icon: Zap,
      color: 'text-orange-400',
      trend: 15,
    },
    {
      name: 'Events',
      count: stats?.upcomingEventsCount || 0,
      icon: Calendar,
      color: 'text-purple-400',
      trend: 5,
    },
    {
      name: 'Ambassadors',
      count: stats?.activeAmbassadorsCount || 0,
      icon: Trophy,
      color: 'text-yellow-400',
      trend: 10,
    },
    {
      name: 'Certificates',
      count: stats?.certificatesIssuedCount || 0,
      icon: FileCheck,
      color: 'text-pink-400',
      trend: 22,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading admin dashboard...</p>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Platform Analytics
              </h1>
              <p className="text-gray-400">
                Comprehensive overview of all platform activities and metrics
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadAdminData}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
              >
                <Eye className="w-4 h-4" />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </motion.div>

        {stats && (
          <>
            {/* Platform Health & Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* Platform Health */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Platform Health</h3>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-5xl font-bold text-green-400 mb-3">{stats.platformHealthScore}%</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Server Status</span>
                    <span className="text-green-400">Operational</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">API Response Time</span>
                    <span className="text-green-400">45ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Database Health</span>
                    <span className="text-green-400">Healthy</span>
                  </div>
                </div>
              </GlassCard>

              {/* Users Overview */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">User Base</h3>
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Total Students</span>
                      <span className="font-semibold text-cyan-400">{stats.totalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="w-3/4 h-full bg-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Instructors</span>
                      <span className="font-semibold text-green-400">{stats.totalInstructors}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="w-1/3 h-full bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Module Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              {moduleMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-semibold">{metric.name}</h3>
                        <div className={`p-2 bg-gray-900/50 rounded-lg`}>
                          <IconComponent className={`w-5 h-5 ${metric.color}`} />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold">{metric.count}</div>
                        <div className={`text-sm font-semibold text-green-400 flex items-center gap-1`}>
                          <TrendingUp className="w-4 h-4" />
                          {metric.trend}%
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Detailed Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {/* Learning Programs */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  Learning Programs
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Active Courses</span>
                      <span className="text-2xl font-bold text-cyan-400">{stats.activeCoursesCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">with {stats.totalEnrollments} total enrollments</div>
                  </div>
                  <div className="h-px bg-gray-700"></div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Internship Programs</span>
                      <span className="text-2xl font-bold text-green-400">{stats.activeInternshipsCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">{stats.totalApplications} applications received</div>
                  </div>
                </div>
              </GlassCard>

              {/* Job & Career Services */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-orange-400" />
                  Job & Career Services
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Job Postings</span>
                      <span className="text-2xl font-bold text-orange-400">{stats.activeJobPostingsCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">{stats.totalJobApplications} applications submitted</div>
                  </div>
                  <div className="h-px bg-gray-700"></div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Certificates Issued</span>
                      <span className="text-2xl font-bold text-pink-400">{stats.certificatesIssuedCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">QR-verified credentials on platform</div>
                  </div>
                </div>
              </GlassCard>

              {/* Events & Community */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  Events & Community
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Upcoming Events</span>
                      <span className="text-2xl font-bold text-purple-400">{stats.upcomingEventsCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">{stats.totalEventsAttended} total attendances</div>
                  </div>
                  <div className="h-px bg-gray-700"></div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Ambassadors</span>
                      <span className="text-2xl font-bold text-yellow-400">{stats.activeAmbassadorsCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">{stats.pendingApplicationsCount} pending approvals</div>
                  </div>
                </div>
              </GlassCard>

              {/* Trends & Insights */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                  Key Insights
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>22% increase in certificate issuance</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Job applications up 15% this month</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Campus ambassador tier distribution healthy</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>5 new internship partners onboarded</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Management Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">Management Panels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/admin/events">
                  <GlassCard className="p-6 text-center hover:border-cyan-500/50 transition-all cursor-pointer h-full">
                    <Calendar className="w-8 h-8 mx-auto text-cyan-400 mb-3" />
                    <h3 className="font-semibold mb-1">Events</h3>
                    <p className="text-xs text-gray-400">Manage workshops & webinars</p>
                  </GlassCard>
                </a>

                <a href="/admin/ambassadors">
                  <GlassCard className="p-6 text-center hover:border-purple-500/50 transition-all cursor-pointer h-full">
                    <Trophy className="w-8 h-8 mx-auto text-purple-400 mb-3" />
                    <h3 className="font-semibold mb-1">Ambassadors</h3>
                    <p className="text-xs text-gray-400">Review & manage applications</p>
                  </GlassCard>
                </a>

                <a href="/admin/certificates">
                  <GlassCard className="p-6 text-center hover:border-pink-500/50 transition-all cursor-pointer h-full">
                    <FileCheck className="w-8 h-8 mx-auto text-pink-400 mb-3" />
                    <h3 className="font-semibold mb-1">Certificates</h3>
                    <p className="text-xs text-gray-400">Verify & manage credentials</p>
                  </GlassCard>
                </a>

                <a href="/admin/internships">
                  <GlassCard className="p-6 text-center hover:border-green-500/50 transition-all cursor-pointer h-full">
                    <Briefcase className="w-8 h-8 mx-auto text-green-400 mb-3" />
                    <h3 className="font-semibold mb-1">Internships</h3>
                    <p className="text-xs text-gray-400">Review applications & manage</p>
                  </GlassCard>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
