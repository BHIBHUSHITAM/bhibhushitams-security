'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Award, TrendingUp, Users, Filter, Eye, EyeOff, BarChart3 } from 'lucide-react';
import {
  getPendingApplications,
  reviewApplication,
  getActiveAmbassadors,
  updateMetrics,
  deactivateAmbassador,
  getAmbassadorStats,
  AmbassadorApplication,
  Ambassador,
  AmbassadorStats,
} from '@/lib/ambassadors/api';
import { GlassCard } from '@/components/landing/glass-card';

type AmbassadorTier = 'bronze' | 'silver' | 'gold' | 'platinum';
type Tab = 'applications' | 'ambassadors' | 'statistics';

const TIER_OPTIONS: AmbassadorTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export const AdminAmbassadorPanel = () => {
  const [tab, setTab] = useState<Tab>('applications');
  const [pendingApplications, setPendingApplications] = useState<AmbassadorApplication[]>([]);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [stats, setStats] = useState<AmbassadorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal States
  const [selectedApp, setSelectedApp] = useState<AmbassadorApplication | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewApproved, setReviewApproved] = useState(false);
  const [reviewTier, setReviewTier] = useState<AmbassadorTier>('bronze');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Edit Metrics Modal
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);
  const [metricsModal, setMetricsModal] = useState(false);
  const [metrics, setMetrics] = useState({ events: 0, recruits: 0, reach: 0 });

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === 'applications') {
        const res = await getPendingApplications();
        setPendingApplications(res.data || []);
      } else if (tab === 'ambassadors') {
        const res = await getActiveAmbassadors();
        setAmbassadors(res.data || []);
      } else if (tab === 'statistics') {
        const res = await getAmbassadorStats();
        setStats(res.data || null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedApp) return;

    try {
      setSubmitting(true);
      const result = await reviewApplication(
        selectedApp._id,
        reviewApproved,
        reviewApproved ? reviewTier : undefined,
        reviewNotes || undefined,
        !reviewApproved ? rejectionReason : undefined
      );

      if (result.success) {
        setReviewModal(false);
        setSelectedApp(null);
        loadData();
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMetricsUpdate = async () => {
    if (!selectedAmbassador) return;

    try {
      setSubmitting(true);
      const result = await updateMetrics(
        selectedAmbassador._id,
        metrics.events > 0 ? metrics.events : undefined,
        metrics.recruits > 0 ? metrics.recruits : undefined,
        metrics.reach > 0 ? metrics.reach : undefined
      );

      if (result.success) {
        setMetricsModal(false);
        setSelectedAmbassador(null);
        loadData();
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (ambassadorId: string) => {
    if (!confirm('Are you sure you want to deactivate this ambassador?')) return;

    try {
      setSubmitting(true);
      await deactivateAmbassador(ambassadorId);
      loadData();
    } catch (error) {
      console.error('Error deactivating ambassador:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (app: AmbassadorApplication, approved: boolean) => {
    setSelectedApp(app);
    setReviewApproved(approved);
    setReviewTier('bronze');
    setReviewNotes('');
    setRejectionReason('');
    setReviewModal(true);
  };

  const openMetricsModal = (ambassador: Ambassador) => {
    setSelectedAmbassador(ambassador);
    setMetrics({ events: 0, recruits: 0, reach: 0 });
    setMetricsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ambassador Management
          </h1>
          <p className="text-gray-400">
            Review applications, manage profiles, and track statistics
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {(['applications', 'ambassadors', 'statistics'] as Tab[]).map(t => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 font-semibold capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-cyan-400'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-gray-400">Loading {tab}...</p>
          </div>
        ) : (
          <>
            {/* Applications Tab */}
            {tab === 'applications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Pending Applications ({pendingApplications.length})
                </h2>

                {pendingApplications.length === 0 ? (
                  <GlassCard className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                    <p className="text-xl text-gray-400">No pending applications</p>
                  </GlassCard>
                ) : (
                  pendingApplications.map((app, index) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold">
                              {typeof app.studentId === 'string' ? app.studentId : app.studentId?.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {app.college} • {app.department}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              Applied: {new Date(app.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs uppercase font-semibold">
                            Pending
                          </span>
                        </div>

                        <p className="text-gray-300 mb-4 line-clamp-2">
                          <strong>Why Ambassador:</strong> {app.whyAmbassador}
                        </p>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openReviewModal(app, true)}
                            className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 font-semibold flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openReviewModal(app, false)}
                            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 font-semibold flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </motion.button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Ambassadors Tab */}
            {tab === 'ambassadors' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Active Ambassadors ({ambassadors.length})
                </h2>

                {ambassadors.length === 0 ? (
                  <GlassCard className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-400">No active ambassadors</p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {ambassadors.map((ambassador, index) => (
                      <motion.div
                        key={ambassador._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GlassCard className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold">{ambassador.studentId?.name}</h3>
                              <p className="text-gray-400 text-sm">{ambassador.college}</p>
                              <span className="inline-block mt-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs uppercase font-semibold capitalize">
                                {ambassador.tier}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-cyan-400">{ambassador.engagementScore}</div>
                              <div className="text-xs text-gray-400">Score</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-900/50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm font-bold text-cyan-400">{ambassador.eventsOrganized}</div>
                              <div className="text-xs text-gray-400">Events</div>
                            </div>
                            <div className="text-center border-l border-r border-gray-700">
                              <div className="text-sm font-bold text-cyan-400">{ambassador.studentsRecruited}</div>
                              <div className="text-xs text-gray-400">Recruited</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-cyan-400">{ambassador.totalReach}</div>
                              <div className="text-xs text-gray-400">Reach</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openMetricsModal(ambassador)}
                              className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 font-semibold"
                            >
                              Edit Metrics
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeactivate(ambassador._id)}
                              disabled={submitting}
                              className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 font-semibold disabled:opacity-50"
                            >
                              Deactivate
                            </motion.button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Statistics Tab */}
            {tab === 'statistics' && stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Program Statistics</h2>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">Total Ambassadors</p>
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-3xl font-bold text-cyan-400">{stats.totalAmbassadors}</p>
                  </GlassCard>

                  <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">Active Ambassadors</p>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-green-400">{stats.activeAmbassadors}</p>
                  </GlassCard>

                  <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">Pending Applications</p>
                      <Loader className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">{stats.pendingApplications}</p>
                  </GlassCard>

                  <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">Total Reach</p>
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-purple-400">{stats.totalReach}</p>
                  </GlassCard>
                </div>

                {/* Tier Distribution */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold mb-4">Ambassador Distribution by Tier</h3>
                  <div className="space-y-4">
                    {(['bronze', 'silver', 'gold', 'platinum'] as AmbassadorTier[]).map(tier => (
                      <div key={tier}>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300 capitalize">{tier.toUpperCase()}</span>
                          <span className="text-sm font-semibold text-cyan-400">
                            {stats.byTier[tier] || 0} ambassadors
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            animate={{
                              width: `${Math.min(
                                ((stats.byTier[tier] || 0) / Math.max(stats.activeAmbassadors, 1)) * 100,
                                100
                              )}%`,
                            }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Average Metrics */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold mb-4">Average Engagement Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-cyan-400">
                      {Math.round(stats.averageEngagementScore)}
                    </div>
                    <p className="text-gray-400">
                      Average engagement score across all active ambassadors (out of 100)
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Review Application Modal */}
      <AnimatePresence>
        {reviewModal && selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {reviewApproved ? 'Approve' : 'Reject'} Application
                </h2>

                {reviewApproved ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Assign Tier</label>
                      <select
                        value={reviewTier}
                        onChange={(e) => setReviewTier(e.target.value as AmbassadorTier)}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                      >
                        {TIER_OPTIONS.map(tier => (
                          <option key={tier} value={tier}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add any notes for the ambassador..."
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why the application was rejected..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReviewModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReview}
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 ${
                      reviewApproved
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {submitting ? 'Submitting...' : reviewApproved ? 'Approve' : 'Reject'}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Metrics Modal */}
      <AnimatePresence>
        {metricsModal && selectedAmbassador && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setMetricsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-4">Update Metrics</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Events Organized</label>
                    <input
                      type="number"
                      value={metrics.events}
                      onChange={(e) => setMetrics({ ...metrics, events: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Students Recruited</label>
                    <input
                      type="number"
                      value={metrics.recruits}
                      onChange={(e) => setMetrics({ ...metrics, recruits: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Total Reach</label>
                    <input
                      type="number"
                      value={metrics.reach}
                      onChange={(e) => setMetrics({ ...metrics, reach: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMetricsModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMetricsUpdate}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-500/30 disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update'}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
