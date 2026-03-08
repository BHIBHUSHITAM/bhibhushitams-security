'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Calendar, AlertCircle, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { getMyApplication, getMyProfile, AmbassadorApplication, Ambassador } from '@/lib/ambassadors/api';
import { GlassCard } from '@/components/landing/glass-card';

type AmbassadorTier = 'bronze' | 'silver' | 'gold' | 'platinum';

const TIER_REQUIREMENTS: Record<AmbassadorTier, { events: number; recruits: number }> = {
  bronze: { events: 0, recruits: 0 },
  silver: { events: 2, recruits: 10 },
  gold: { events: 5, recruits: 25 },
  platinum: { events: 10, recruits: 50 },
};

const TIER_LEVELS: AmbassadorTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export const StudentAmbassadorDashboard = () => {
  const [application, setApplication] = useState<AmbassadorApplication | null>(null);
  const [profile, setProfile] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appRes, profileRes] = await Promise.all([
        getMyApplication(),
        getMyProfile().catch(() => ({ success: false, data: null })),
      ]);

      if (appRes.success) {
        setApplication(appRes.data || null);
      }
      if (profileRes.success) {
        setProfile(profileRes.data || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: AmbassadorTier) => {
    const colors: Record<AmbassadorTier, string> = {
      bronze: 'from-amber-600 to-amber-500',
      silver: 'from-slate-400 to-slate-300',
      gold: 'from-yellow-500 to-yellow-400',
      platinum: 'from-cyan-400 to-blue-500',
    };
    return colors[tier];
  };

  const getTierIcon = (tier: AmbassadorTier) => {
    const icons: Record<AmbassadorTier, typeof Trophy> = {
      bronze: Trophy,
      silver: Trophy,
      gold: Trophy,
      platinum: Trophy,
    };
    return icons[tier];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const currentTierIndex = profile ? TIER_LEVELS.indexOf(profile.tier) : -1;
  const nextTier = currentTierIndex < TIER_LEVELS.length - 1 ? TIER_LEVELS[currentTierIndex + 1] : null;
  const nextTierReqs = nextTier ? TIER_REQUIREMENTS[nextTier] : null;
  const currentReqs = profile ? TIER_REQUIREMENTS[profile.tier] : null;

  const getTierProgress = () => {
    if (!profile || !nextTierReqs) return 0;
    const currentReqs = TIER_REQUIREMENTS[profile.tier];
    const maxEvents = nextTierReqs.events;
    const maxRecruits = nextTierReqs.recruits;

    if (maxEvents === 0 && maxRecruits === 0) return 100;

    const eventProgress = maxEvents > 0 ? (profile.eventsOrganized / maxEvents) * 100 : 0;
    const recruitProgress = maxRecruits > 0 ? (profile.studentsRecruited / maxRecruits) * 100 : 0;

    return Math.min((eventProgress + recruitProgress) / 2, 100);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ambassador Dashboard
          </h1>
          <p className="text-gray-400">
            Track your application and ambassador journey
          </p>
        </motion.div>

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

        {!application ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Application Yet</h2>
              <p className="text-gray-400 mb-6">
                You haven't submitted an ambassador application yet. Click below to start your journey!
              </p>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/ambassadors/apply"
                className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Apply Now <ArrowRight className="inline ml-2 w-4 h-4" />
              </motion.a>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Application Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Application Status</h2>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(application.status)}
                    <span className={`px-4 py-2 rounded-lg font-semibold capitalize ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Applied On</p>
                    <p className="text-lg font-semibold">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {application.reviewedDate && (
                    <div>
                      <p className="text-gray-400 text-sm">Reviewed On</p>
                      <p className="text-lg font-semibold">
                        {new Date(application.reviewedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {application.status === 'rejected' && application.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm font-medium mb-1">Reason for Rejection</p>
                    <p className="text-gray-300">{application.rejectionReason}</p>
                  </div>
                )}

                {application.adminNotes && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium mb-1">Admin Notes</p>
                    <p className="text-gray-300">{application.adminNotes}</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Tier & Profile (Approved) */}
            {profile && (application.status === 'approved' || application.status === 'active') && (
              <>
                {/* Tier Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GlassCard className={`p-6 bg-gradient-to-br ${getTierColor(profile.tier)} opacity-10`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`bg-gradient-to-br ${getTierColor(profile.tier)} rounded-full p-3`}>
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-gray-400 text-sm">Current Tier</h3>
                        <h2 className="text-3xl font-bold capitalize">{profile.tier}</h2>
                      </div>
                    </div>

                    {nextTier && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Progress to {nextTier.toUpperCase()}</span>
                          <span className="text-sm font-semibold text-cyan-400">{Math.round(getTierProgress())}%</span>
                        </div>
                        <div className="h-3 bg-gray-900/50 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: `${getTierProgress()}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Engagement Score */}
                    <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Engagement Score</p>
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                      <p className="text-3xl font-bold text-cyan-400">{profile.engagementScore}</p>
                      <p className="text-xs text-gray-500 mt-1">out of 100</p>
                    </GlassCard>

                    {/* Events Organized */}
                    <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Events Organized</p>
                        <Calendar className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold text-green-400">{profile.eventsOrganized}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {nextTierReqs ? `${Math.max(0, nextTierReqs.events - profile.eventsOrganized)} to next` : 'Max tier'}
                      </p>
                    </GlassCard>

                    {/* Students Recruited */}
                    <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Students Recruited</p>
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="text-3xl font-bold text-purple-400">{profile.studentsRecruited}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {nextTierReqs ? `${Math.max(0, nextTierReqs.recruits - profile.studentsRecruited)} to next` : 'Max tier'}
                      </p>
                    </GlassCard>

                    {/* Total Reach */}
                    <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-sm">Total Reach</p>
                        <Target className="w-5 h-5 text-orange-400" />
                      </div>
                      <p className="text-3xl font-bold text-orange-400">{profile.totalReach}</p>
                      <p className="text-xs text-gray-500 mt-1">Total people reached</p>
                    </GlassCard>
                  </div>
                </motion.div>

                {/* Tier Requirements */}
                {nextTier && nextTierReqs && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-bold mb-4">
                        Requirements to reach <span className="capitalize text-cyan-400">{nextTier}</span> tier
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-300">Events Organized</span>
                            <span className="text-sm font-semibold text-cyan-400">
                              {profile.eventsOrganized}/{nextTierReqs.events}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ width: `${Math.min((profile.eventsOrganized / nextTierReqs.events) * 100, 100)}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-300">Students Recruited</span>
                            <span className="text-sm font-semibold text-cyan-400">
                              {profile.studentsRecruited}/{nextTierReqs.recruits}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ width: `${Math.min((profile.studentsRecruited / nextTierReqs.recruits) * 100, 100)}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mt-4">
                        Keep working to unlock the next tier and gain more recognition and privileges!
                      </p>
                    </GlassCard>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
